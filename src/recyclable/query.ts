import { isNumber, SyncDestructor } from '@blackglory/prelude'
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
  private entityIdIndex: CleanSparseSet

  // BitSet天然为增序.
  // 虽然遍历BitSet的速度不算快, 但基准测试表明,
  // 只要entityId是从0开始自增, 直接遍历BitSet总是要比其他方法快得多.
  private entityIdAscendingIndex: BitSet

  /**
   * 为弥补BitSet遍历性能不足而准备的缓存.
   */
  private entityIdAscendingIndexCache: number[] = []
  private isEntityIdAscendingCacheIndexStale: boolean = true

  constructor(
    private world: RecyclableWorld<ComponentId>
  , pattern: Pattern<ComponentId>
  ) {
    const entityIdsSparseSet = new CleanSparseSet()
    const entityIdsBitSet = new BitSet()
    for (const entityId of world.findAllEntityIds()) {
      if (this.isMatch(entityId, pattern)) {
        entityIdsSparseSet.add(entityId)
        entityIdsBitSet.add(entityId)
      }
    }
    this.entityIdIndex = entityIdsSparseSet
    this.entityIdAscendingIndex = entityIdsBitSet

    this.destructor.defer(world.on(RecyclableWorldEvent.EntityRemoved, entityId => {
      this.removeEntityId(entityId)
    }))

    const relatedComponentIds = new CleanSparseSet()
    for (const componentId of extractComponentIds(pattern)) {
      relatedComponentIds.add(componentId)
    }

    this.destructor.defer(world.on(RecyclableWorldEvent.EntityComponentsChanged, (
      entityId
    , changedComponentIds
    ) => {
      const isRelatedComponentsChanged = changedComponentIds
        .some(componentId => relatedComponentIds.has(componentId))

      if (isRelatedComponentsChanged) {
        if (this.hasEntityId(entityId)) {
          if (!this.isMatch(entityId, pattern)) {
            this.removeEntityId(entityId)
          }
        } else {
          if (this.isMatch(entityId, pattern)) {
            this.addEntityId(entityId)
          }
        }
      }
    }))
  }

  hasEntityId(entityId: number): boolean {
    return this.entityIdIndex.has(entityId)
  }

  findAllEntityIds(): IterableIterator<number> {
    return this.entityIdIndex.values()
  }

  findAllEntityIdsAscending(): IterableIterator<number> {
    if (this.isEntityIdAscendingCacheIndexStale) {
      // 基准测试表明, "用`Arary.from()`生成数组, 然后再遍历数组"与"边迭代边缓存"的速度相当.
      // 前者的一大优点是缓存能立即完成更新, 不需要像后者那样等待迭代完成才能完成更新.
      const entityIdAscendingIndexCache = Array.from(this.entityIdAscendingIndex)
      this.entityIdAscendingIndexCache = entityIdAscendingIndexCache
      this.isEntityIdAscendingCacheIndexStale = false

      return entityIdAscendingIndexCache.values()
    } else {
      return this.entityIdAscendingIndexCache.values()
    }
  }

  destroy(): void {
    this.destructor.execute()
  }

  private removeEntityId(entityId: number): void {
    if (this.entityIdIndex.delete(entityId)) {
      this.entityIdAscendingIndex.delete(entityId)
      this.isEntityIdAscendingCacheIndexStale = true
    }
  }

  private addEntityId(entityId: number): void {
    if (this.entityIdIndex.add(entityId)) {
      this.entityIdAscendingIndex.add(entityId)
      this.isEntityIdAscendingCacheIndexStale = true
    }
  }

  private isMatch(
    entityId: number
  , pattern: Pattern<ComponentId>
  ): boolean {
    if (isNumber(pattern)) {
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
