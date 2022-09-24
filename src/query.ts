import { toArray, some, filter, every, drop, count } from 'iterable-operator'
import { World, WorldEvent } from './world'
import { Pattern, isExpression, isAllOf, isAnyOf, isNot, isOneOf } from './pattern'
import { assert } from '@blackglory/prelude'
import { BitSet } from '@blackglory/structures'
import { Component } from './component'

export class Query {
  private isAvailable: boolean = true
  // 遍历BitSet很慢, 但它具有增序的特性.
  // 在entityIds较为密集的情况下, 遍历一遍BitSet比把Set<number>转为数组再排序要快.
  private entityIds = new BitSet()
  private entityIdsChanged = false
  private entityIdsCache: number[] = []
  private relatedComponentSet: Set<Component> = new Set()
  private removeEntityRemovedListener = this.world.on(
    WorldEvent.EntityRemoved
  , (entityId: number) => {
      this.removeEntityId(entityId)
    }
  )
  private removeEntityComponentsChangedListener = this.world.on(
    WorldEvent.EntityComponentsChanged
  , (entityId: number, changedComponents: Component[]): void => {
      const isChangedComponentsRelated = changedComponents.some(component => {
        return this.isComponentRelated(component)
      })
      if (isChangedComponentsRelated) {
        if (this.hasEntityId(entityId)) {
          if (!this.isMatch(entityId)) {
            this.removeEntityId(entityId)
          }
        } else {
          if (this.isMatch(entityId)) {
            this.addEntityId(entityId)
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
        this.entityIdsChanged = true
      }
    }

    this.updateEntityIdsCache()
  }

  // 该方法会非常频繁地被调用, 需要特别关注其性能表现.
  findAllEntityIds(): Iterable<number> {
    assert(this.isAvailable, 'The query is not available')

    this.updateEntityIdsCache()

    return this.entityIdsCache
  }

  destroy(): void {
    this.isAvailable = false
    this.removeEntityComponentsChangedListener()
    this.removeEntityRemovedListener()
  }

  hasEntityId(entityId: number): boolean {
    return this.entityIds.has(entityId)
  }

  private removeEntityId(entityId: number): void {
    const deleted = this.entityIds.delete(entityId)
    if (deleted) {
      this.entityIdsChanged = true
    }
  }

  private addEntityId(entityId: number): void {
    const added = this.entityIds.add(entityId)
    if (added) {
      this.entityIdsChanged = true
    }
  }

  private updateEntityIdsCache() {
    if (this.entityIdsChanged) {
      this.entityIdsCache = toArray(this.entityIds.values())
      this.entityIdsChanged = false
    }
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
      const component = pattern
      return this.world._hasComponent(entityId, component)
    }
  }
}
