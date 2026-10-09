import { SyncDestructor } from '@blackglory/prelude'
import { BitSet, CleanSparseSet } from '@blackglory/structures'
import { assertNever } from 'assert-never'
import { Pattern, extractComponentIds, Operator } from '@src/pattern.js'
import { RecyclableWorld, RecyclableWorldEvent } from './world.js'

// Query为世界中的记录创建并维护索引.
// 与数据库的索引一样, 这会降低"添加和删除实体/组件"时的速度.
// Query的索引建立在对象内部, 没有任何形式的共享, 因此务必只创建必要的查询.
export class RecyclableQuery<ComponentId extends number> {
  private destructor: SyncDestructor = new SyncDestructor()

  // 用来弥补BitSet在一些方面的性能不足.
  private entityIdSet: CleanSparseSet

  // BitSet天然为增序.
  // 虽然遍历BitSet的速度不算快, 但基准测试表明,
  // 只要entityId是从0开始自增, 直接遍历BitSet总是要比其他方法快得多.
  private entityIdSetAscending: BitSet

  /**
   * 为弥补BitSet遍历性能不足而准备的缓存.
   */
  private entityIdSetAscendingCache: number[] = []
  private isEntityIdSetAscendingCacheStale: boolean = true

  // 用于将索引更新延后到查询的时候.
  private pendingEntityIdSet: CleanSparseSet = new CleanSparseSet()

  constructor(
    private world: RecyclableWorld<ComponentId>
  , private pattern: Pattern<ComponentId>
  ) {
    const entityIdSparseSet = new CleanSparseSet()
    const entityIdBitSet = new BitSet()
    for (const entityId of world.findAllEntityIds()) {
      if (this.isMatch(entityId, pattern)) {
        entityIdSparseSet.add(entityId)
        entityIdBitSet.add(entityId)
      }
    }
    this.entityIdSet = entityIdSparseSet
    this.entityIdSetAscending = entityIdBitSet

    this.destructor.defer(world.on(RecyclableWorldEvent.EntityRemoved, entityId => {
      this.pendingEntityIdSet.delete(entityId)

      if (this.entityIdSet.delete(entityId)) {
        this.entityIdSetAscending.delete(entityId)
        this.isEntityIdSetAscendingCacheStale = true
      }
    }))

    const relatedComponentIds = new CleanSparseSet()
    for (const componentId of extractComponentIds(pattern)) {
      relatedComponentIds.add(componentId)
    }

    this.destructor.defer(world.on(RecyclableWorldEvent.EntityComponentsChanged, (
      entityId
    , changedComponentIds
    ) => {
      if (!this.pendingEntityIdSet.has(entityId)) {
        const isRelatedComponentsChanged = changedComponentIds
          .some(componentId => relatedComponentIds.has(componentId))

        if (isRelatedComponentsChanged) {
          this.pendingEntityIdSet.add(entityId)
        }
      }
    }))
  }

  hasEntityId(entityId: number): boolean {
    this.consumePendingEntityIdSet()

    return this.entityIdSet.has(entityId)
  }

  findAllEntityIds(): IterableIterator<number> {
    this.consumePendingEntityIdSet()

    return this.entityIdSet.values()
  }

  findAllEntityIdsAscending(): IterableIterator<number> {
    this.consumePendingEntityIdSet()

    if (this.isEntityIdSetAscendingCacheStale) {
      // 基准测试表明, "用`Arary.from()`生成数组, 然后再遍历数组"与"边迭代边缓存"的速度相当.
      // 前者的一大优点是缓存能立即完成更新, 不需要像后者那样等待迭代完成才能完成更新.
      const entityIdAscendingIndexCache = Array.from(this.entityIdSetAscending)
      this.entityIdSetAscendingCache = entityIdAscendingIndexCache
      this.isEntityIdSetAscendingCacheStale = false

      return entityIdAscendingIndexCache.values()
    } else {
      return this.entityIdSetAscendingCache.values()
    }
  }

  destroy(): void {
    this.destructor.execute()
  }

  private consumePendingEntityIdSet(): void {
    if (this.pendingEntityIdSet.size) {
      for (const entityId of this.pendingEntityIdSet.values()) {
        if (this.entityIdSet.has(entityId)) {
          if (!this.isMatch(entityId, this.pattern)) {
            this.entityIdSet.delete(entityId)

            this.entityIdSetAscending.delete(entityId)
            this.isEntityIdSetAscendingCacheStale = true
          }
        } else {
          if (this.isMatch(entityId, this.pattern)) {
            this.entityIdSet.add(entityId)

            this.entityIdSetAscending.add(entityId)
            this.isEntityIdSetAscendingCacheStale = true
          }
        }
      }

      this.pendingEntityIdSet.clear()
    }
  }

  private isMatch(
    entityId: number
  , pattern: Pattern<ComponentId>
  ): boolean {
    if (typeof pattern === 'number') {
      const componentId = pattern
      return this.world.hasComponentId(entityId, componentId)
    } else {
      switch (pattern.type) {
        case Operator.Not: {
          return !pattern.children
            .some(pattern => this.isMatch(entityId, pattern as Pattern<ComponentId>))
        }
        case Operator.AllOf: {
          return pattern.children
            .every(pattern => this.isMatch(entityId, pattern as Pattern<ComponentId>))
        }
        case Operator.AnyOf: {
          return pattern.children
            .some(pattern => this.isMatch(entityId, pattern as Pattern<ComponentId>))
        }
        case Operator.OneOf: {
          return pattern.children
            .filter(pattern => this.isMatch(entityId, pattern as Pattern<ComponentId>))
            .length === 1
        }
        default: assertNever(pattern)
      }
    }
  }
}
