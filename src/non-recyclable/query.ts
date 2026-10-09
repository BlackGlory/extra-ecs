import { SyncDestructor } from '@blackglory/prelude'
import { CleanSparseSet } from '@blackglory/structures'
import { assertNever } from 'assert-never'
import { Pattern, extractComponentIds, Operator } from '@src/pattern.js'
import { NonRecyclableWorld, NonRecyclableWorldEvent } from './world.js'

// Query为世界中的记录创建并维护索引.
// 与数据库的索引一样, 这会降低"添加和删除实体/组件"时的速度.
// Query的索引建立在对象内部, 没有任何形式的共享, 因此务必只创建必要的查询.
export class NonRecyclableQuery<ComponentId extends number> {
  private destructor: SyncDestructor = new SyncDestructor()

  private entityIdSet: CleanSparseSet = new CleanSparseSet()

  // 用于将索引更新延后到查询的时候.
  private pendingEntityIdSet: CleanSparseSet = new CleanSparseSet()

  constructor(
    private world: NonRecyclableWorld<ComponentId>
  , private pattern: Pattern<ComponentId>
  ) {
    const entityIdSet = new CleanSparseSet()
    for (const entityId of world.findAllEntityIds()) {
      if (this.isMatch(entityId, pattern)) {
        entityIdSet.add(entityId)
      }
    }
    this.entityIdSet = entityIdSet

    this.destructor.defer(this.world.on(NonRecyclableWorldEvent.EntityRemoved, entityId => {
      this.pendingEntityIdSet.delete(entityId)
      this.entityIdSet.delete(entityId)
    }))

    const relatedComponentIds = new CleanSparseSet()
    for (const componentId of extractComponentIds(pattern)) {
      relatedComponentIds.add(componentId)
    }

    this.destructor.defer(this.world.on(NonRecyclableWorldEvent.EntityComponentsChanged, (
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

  destroy(): void {
    this.destructor.execute()
  }

  private consumePendingEntityIdSet(): void {
    if (this.pendingEntityIdSet.size) {
      for (const entityId of this.pendingEntityIdSet.values()) {
        if (this.entityIdSet.has(entityId)) {
          if (!this.isMatch(entityId, this.pattern)) {
            this.entityIdSet.delete(entityId)
          }
        } else {
          if (this.isMatch(entityId, this.pattern)) {
            this.entityIdSet.add(entityId)
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
