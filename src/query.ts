import { some, filter, every, drop, count } from 'iterable-operator'
import { World, Event } from './world'
import { Pattern, isExpression, isAllOf, isAnyOf, isNot, isOneOf } from './pattern'
import { assert } from '@blackglory/prelude'
import { Component } from './component'

export class Query {
  private isAvailable: boolean = true
  private matchedEntityIdsCache: number[] = []
  private matchedEntityIdsCacheShouldUpdate = true
  private removeEntityRemovedListener = this.world.on(
    Event.EntityRemoved
  , (entityId: number) => {
      this.matchedEntityIdsCacheShouldUpdate = true
    }
  )
  private removeEntityComponentsChangedListener = this.world.on(
    Event.EntityComponentsChanged
  , (entityId: number, changedComponents: Component[]): void => {
      this.matchedEntityIdsCacheShouldUpdate = true
    }
  )

  /**
   * 创建一个查询, 查询在世界内部建立一个索引, 每次查询时会直接使用此索引, 这使得查询性能变得非常好.
   * 与数据库的索引一样, 为世界维护查询会降低为实体添加和删除组件时的性能, 因此务必只创建必要的查询.
   */
  constructor(
    private readonly world: World
  , private readonly pattern: Pattern
  ) {}

  findAllEntityIds(): Iterable<number> {
    assert(this.isAvailable, 'The query is not available')

    this.updateEntityIdsCache()

    return this.matchedEntityIdsCache
  }

  destroy(): void {
    this.isAvailable = false
    this.removeEntityComponentsChangedListener()
    this.removeEntityRemovedListener()
  }

  private updateEntityIdsCache() {
    if (this.matchedEntityIdsCacheShouldUpdate) {
      const entityIds: number[] = []
      for (const entityId of this.world.getAllEntityIds()) {
        if (this.isMatch(entityId)) {
          entityIds.push(entityId)
        }
      }
      this.matchedEntityIdsCache = entityIds
      this.matchedEntityIdsCacheShouldUpdate = false
    }
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
      return this.world._entityIdToComponentSet[entityId]?.has(pattern)
          ?? false
    }
  }
}
