import { StructureOfArrays } from 'structure-of-arrays'
import { some, map } from 'iterable-operator'
import { World } from './world'
import { Entity } from './entity'
import { Pattern, isExpression, isAllOf, isAnyOf, isNot, isOneOf } from './pattern'
import { assert } from '@blackglory/prelude'

export class Query {
  private isAvailable: boolean = true
  private entityIds = new Set<number>()
  private sortedEntityIds: number[] = []
  private entityIdsAdded: boolean = false
  private entityIdsDeleted: boolean = false
  private relatedComponents = new Set<StructureOfArrays<any>>()
  private removeEntityComponentsChangedListener = this.world.on(
    'entityComponentsChanged'
  , (entityId: number, components: Array<StructureOfArrays<any>>): void => {
      const isRelated = components.some(component => this.isComponentRelated(component))
      if (isRelated) {
        if (this.entityIds.has(entityId)) {
          if (!this.isMatch(entityId)) {
            this.entityIds.delete(entityId)
            this.entityIdsDeleted = true
          }
        } else {
          if (this.isMatch(entityId)) {
            this.entityIds.add(entityId)
            this.sortedEntityIds.push(entityId)
            this.entityIdsAdded = true
          }
        }
      }
    }
  )

  /**
   * 创建一个查询, 查询在世界内部建立一个索引, 每次查询时会直接使用此索引, 这使得查询性能变得非常好.
   * 与数据库的索引一样, 为世界维护查询会降低为实体添加和删除组件时的性能, 因此务必只创建必要的查询.
   */
  constructor(
    private readonly world: World
  , private readonly pattern: Pattern
  ) {
    // init `this.relatedComponents`
    for (const component of this.extractComponents(pattern)) {
      this.relatedComponents.add(component)
    }

    // init `this.entitiyIds`
    for (const entityId of this.world.getAllEntityIds()) {
      if (this.isMatch(entityId)) {
        this.entityIds.add(entityId)
        this.sortedEntityIds.push(entityId)
      }
    }

    this.sortedEntityIds.sort()
  }

  findAllEntities(): Iterable<Entity> {
    assert(this.isAvailable, 'The query is not available')

    return map(this.findAllEntityIds(), id => new Entity(this.world, id))
  }

  findAllEntityIds(): Iterable<number> {
    assert(this.isAvailable, 'The query is not available')

    // 经过升序排序的entityIds可以大幅增加访问性能, 因为这更符合内存顺序访问的顺序.
    if (this.entityIdsDeleted) {
      this.sortedEntityIds = [...this.entityIds].sort()
      this.entityIdsDeleted = false
      this.entityIdsAdded = false
    } else if (this.entityIdsAdded) {
      this.sortedEntityIds.sort()
      this.entityIdsAdded = false
    }

    return this.sortedEntityIds
  }

  private * extractComponents(
    pattern: Pattern
  ): Generator<StructureOfArrays<any>, void, void> {
    if (isExpression(pattern)) {
      if (isNot(pattern)) {
        const [, ...patterns] = pattern
        for (const pattern of patterns) {
          yield* this.extractComponents(pattern)
        }
      } else if (isAllOf(pattern)) {
        const [, ...patterns] = pattern
        for (const pattern of patterns) {
          yield* this.extractComponents(pattern)
        }
      } else if (isAnyOf(pattern)) {
        const [, ...patterns] = pattern
        for (const pattern of patterns) {
          yield* this.extractComponents(pattern)
        }
      } else if (isOneOf(pattern)) {
        const [, ...patterns] = pattern
        for (const pattern of patterns) {
          yield* this.extractComponents(pattern)
        }
      } else {
        throw new Error('Invalid pattern')
      }
    } else {
      yield pattern
    }
  }

  private isComponentRelated(component: StructureOfArrays<any>): boolean {
    return this.relatedComponents.has(component)
  }

  private isMatch(entityId: number, pattern: Pattern = this.pattern): boolean {
    if (isExpression(pattern)) {
      if (isNot(pattern)) {
        const [, ...patterns] = pattern
        return !patterns.some(pattern => this.isMatch(entityId, pattern))
      } else if (isAllOf(pattern)) {
        const [, ...patterns] = pattern
        return patterns.every(pattern => this.isMatch(entityId, pattern))
      } else if (isAnyOf(pattern)) {
        const [, ...patterns] = pattern
        return patterns.some(pattern => this.isMatch(entityId, pattern))
      } else if (isOneOf(pattern)) {
        const [, ...patterns] = pattern
        return patterns.filter(pattern => this.isMatch(entityId, pattern)).length === 1
      } else {
        throw new Error('Invalid pattern')
      }
    } else {
      const components = this.world.getComponents(entityId)
      if (components) {
        return some(components, component => component === pattern)
      } else {
        return false
      }
    }
  }

  destroy(): void {
    this.isAvailable = false
    this.removeEntityComponentsChangedListener()
  }
}
