import { some, filter, every, drop, count } from 'iterable-operator'
import { World } from './world'
import { Pattern, isExpression, isAllOf, isAnyOf, isNot, isOneOf } from './pattern'
import { assert } from '@blackglory/prelude'
import { Component, ComponentId } from './component'

export class Query {
  private isAvailable: boolean = true
  private entityIds: Set<number> = new Set()
  // 经过升序排序的entityIds可以大幅增加访问性能,
  // 因为这更符合内存顺序访问的顺序, 同时在分支预测方面也更有利.
  private sortedEntityIds: number[] = []
  private entityIdsAdded: boolean = false
  private entityIdsDeleted: boolean = false
  private relatedComponentIds: Set<ComponentId> = new Set()
  private removeEntityComponentsChangedListener = this.world.on(
    'entityComponentsChanged'
  , (entityId: number, componentIds: ComponentId[]): void => {
      const isRelated = componentIds.some(componentId => this.isComponentIdRelated(componentId))
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
      this.relatedComponentIds.add(this.world.componentRegistry.getComponentId(component))
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

  findAllEntityIds(): Iterable<number> {
    assert(this.isAvailable, 'The query is not available')

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

  private * extractComponents(pattern: Pattern): IterableIterator<Component> {
    if (isExpression(pattern)) {
      if (isNot(pattern)) {
        for (const subPattern of drop(pattern, 1) as Iterable<Pattern>) {
          yield* this.extractComponents(subPattern)
        }
      } else if (isAllOf(pattern)) {
        for (const subPattern of drop(pattern, 1) as Iterable<Pattern>) {
          yield* this.extractComponents(subPattern)
        }
      } else if (isAnyOf(pattern)) {
        for (const subPattern of drop(pattern, 1) as Iterable<Pattern>) {
          yield* this.extractComponents(subPattern)
        }
      } else if (isOneOf(pattern)) {
        for (const subPattern of drop(pattern, 1) as Iterable<Pattern>) {
          yield* this.extractComponents(subPattern)
        }
      } else {
        throw new Error('Invalid pattern')
      }
    } else {
      yield pattern
    }
  }

  private isComponentIdRelated(componentId: ComponentId): boolean {
    return this.relatedComponentIds.has(componentId)
  }

  private isMatch(entityId: number, pattern: Pattern = this.pattern): boolean {
    if (isExpression(pattern)) {
      if (isNot(pattern)) {
        return !some(
          drop(pattern, 1) as Iterable<Pattern>
        , pattern => this.isMatch(entityId, pattern)
        )
      } else if (isAllOf(pattern)) {
        return every(
          drop(pattern, 1) as Iterable<Pattern>
        , pattern => this.isMatch(entityId, pattern)
        )
      } else if (isAnyOf(pattern)) {
        return some(
          drop(pattern, 1) as Iterable<Pattern>
        , pattern => this.isMatch(entityId, pattern)
        )
      } else if (isOneOf(pattern)) {
        return count(filter(
          drop(pattern, 1) as Iterable<Pattern>
        , pattern => this.isMatch(entityId, pattern)
        )) === 1
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
