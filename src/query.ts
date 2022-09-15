import { some, filter, every, drop, count } from 'iterable-operator'
import { World } from './world'
import { Pattern, isExpression, isAllOf, isAnyOf, isNot, isOneOf } from './pattern'
import { assert } from '@blackglory/prelude'
import { Component } from './component'
import { sortNumbersAscending } from 'extra-sort'

export class Query {
  private isAvailable: boolean = true
  private entityIds: Set<number> = new Set()
  // 经过升序排序的entityIds可以大幅增加访问性能,
  // 因为这更符合内存顺序访问的顺序, 同时在分支预测方面也更有利.
  private sortedEntityIds: number[] = []
  private entityIdsAdded: boolean = false
  private entityIdsDeleted: boolean = false
  private relatedComponentSet: Set<Component> = new Set()
  private removeEntityRemovedListener = this.world.on(
    'entityRemoved'
  , (entityId: number) => {
      if (this.entityIds.has(entityId)) {
        this.entityIds.delete(entityId)
        this.entityIdsDeleted = true
      }
    }
  )
  private removeEntityComponentsChangedListener = this.world.on(
    'entityComponentsChanged'
  , (entityId: number, changedComponents: Component[]): void => {
      const isChangedComponentsRelated = changedComponents.some(component => {
        return this.isComponentRelated(component)
      })
      if (isChangedComponentsRelated) {
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
      this.relatedComponentSet.add(component)
    }

    // init `this.entitiyIds`
    for (const entityId of this.world.getAllEntityIds()) {
      if (this.isMatch(entityId)) {
        this.entityIds.add(entityId)
        this.sortedEntityIds.push(entityId)
      }
    }

    sortNumbersAscending(this.sortedEntityIds)
  }

  findAllEntityIds(): Iterable<number> {
    assert(this.isAvailable, 'The query is not available')

    if (this.entityIdsDeleted) {
      const sortedEntityIds = [...this.entityIds]
      sortNumbersAscending(sortedEntityIds)
      this.sortedEntityIds = sortedEntityIds

      this.entityIdsDeleted = false
      this.entityIdsAdded = false
    } else if (this.entityIdsAdded) {
      sortNumbersAscending(this.sortedEntityIds)

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

  private isComponentRelated(component: Component): boolean {
    return this.relatedComponentSet.has(component)
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
    this.removeEntityRemovedListener()
  }
}
