import { some, filter, every, drop, count } from 'iterable-operator'
import { SyncDestructor } from '@blackglory/prelude'
import { CleanSparseSet } from '@blackglory/structures'
import { Pattern, isExpression, isAllOf, isAnyOf, isNot, isOneOf, extractComponentIds } from '@src/pattern.js'
import { NonRecyclableWorld, NonRecylableWorldEvent } from './world.js'

// Query为世界中的记录创建并维护索引.
// 与数据库的索引一样, 这会降低"添加和删除实体/组件"时的速度.
// Query的索引建立在对象内部, 没有任何形式的共享, 因此务必只创建必要的查询.
export class NonRecyclableQuery<ComponentId extends number> {
  private destructor: SyncDestructor = new SyncDestructor()

  private entityIdIndex: CleanSparseSet

  constructor(
    private world: NonRecyclableWorld<ComponentId>
  , private pattern: Pattern<ComponentId>
  ) {
    const entityIdsSparseSet = new CleanSparseSet()
    for (const entityId of this.world.findAllEntityIds()) {
      if (this.isMatch(entityId)) {
        entityIdsSparseSet.add(entityId)
      }
    }
    this.entityIdIndex = entityIdsSparseSet

    this.destructor.defer(this.world.on(NonRecylableWorldEvent.EntityRemoved, entityId => {
      this.removeEntityId(entityId)
    }))

    const relatedComponentIds = new CleanSparseSet()
    for (const componentId of extractComponentIds(pattern)) {
      relatedComponentIds.add(componentId)
    }

    this.destructor.defer(this.world.on(NonRecylableWorldEvent.EntityComponentsChanged, (
      entityId
    , changedComponentIds
    ) => {
      const isRelatedComponentsChanged = changedComponentIds
        .some(componentId => relatedComponentIds.has(componentId))

      if (isRelatedComponentsChanged) {
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
    }))
  }

  hasEntityId(entityId: number): boolean {
    return this.entityIdIndex.has(entityId)
  }

  findAllEntityIds(): IterableIterator<number> {
    return this.entityIdIndex.values()
  }

  destroy(): void {
    this.destructor.execute()
  }

  private removeEntityId(entityId: number): void {
    this.entityIdIndex.delete(entityId)
  }

  private addEntityId(entityId: number): void {
    this.entityIdIndex.add(entityId)
  }

  private isMatch(entityId: number, pattern: Pattern<ComponentId> = this.pattern): boolean {
    if (isExpression(pattern)) {
      if (isNot(pattern)) {
        return !some(
          drop(pattern, 1)
        , pattern => this.isMatch(entityId, pattern as Pattern<ComponentId>)
        )
      } else if (isAllOf(pattern)) {
        return every(
          drop(pattern, 1)
        , pattern => this.isMatch(entityId, pattern as Pattern<ComponentId>)
        )
      } else if (isAnyOf(pattern)) {
        return some(
          drop(pattern, 1)
        , pattern => this.isMatch(entityId, pattern as Pattern<ComponentId>)
        )
      } else if (isOneOf(pattern)) {
        return count(filter(
          drop(pattern, 1)
        , pattern => this.isMatch(entityId, pattern as Pattern<ComponentId>)
        )) === 1
      } else {
        throw new Error('Invalid pattern')
      }
    } else {
      const componentId = pattern
      return this.world.hasComponentId(entityId, componentId)
    }
  }
}
