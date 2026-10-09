import { NonEmptyArray } from '@blackglory/prelude'
import { Emitter, CleanSparseMap, CleanSparseSet } from '@blackglory/structures'

export enum NonRecyclableWorldEvent {
  EntityAdded
, EntityRemoved
, EntityComponentIdsChanged
}

// World本质上是一个内存数据库管理系统.
export class NonRecyclableWorld<ComponentId extends number> extends Emitter<{
  [NonRecyclableWorldEvent.EntityAdded]: [entityId: number]
  [NonRecyclableWorldEvent.EntityRemoved]: [entityId: number]
  [NonRecyclableWorldEvent.EntityComponentIdsChanged]: [entityId: number]
}> {
  private nextEntityId: number = 0
  private entityIds: CleanSparseSet = new CleanSparseSet()
  private componentIdToEntityIdSet: CleanSparseMap<CleanSparseSet> = new CleanSparseMap()

  findAllEntityIds(): IterableIterator<number> {
    return this.entityIds.values()
  }

  hasEntityId(entityId: number): boolean {
    return this.entityIds.has(entityId)
  }

  createEntityId(): number {
    const entityId = this.nextEntityId++
    this.entityIds.add(entityId)

    this.emit(NonRecyclableWorldEvent.EntityAdded, entityId)

    return entityId
  }

  removeEntityId(entityId: number): void {
    if (this.entityIds.delete(entityId)) {
      for (const entityIdSet of this.componentIdToEntityIdSet.values()) {
        entityIdSet.delete(entityId)
      }

      this.emit(NonRecyclableWorldEvent.EntityRemoved, entityId)
    }
  }

  * findComponentIds(entityId: number): IterableIterator<ComponentId> {
    for (const [componentId, entityIdSet] of this.componentIdToEntityIdSet.entries()) {
      if (entityIdSet.has(entityId)) {
        yield componentId as ComponentId
      }
    }
  }

  hasComponentId(entityId: number, componentId: ComponentId): boolean {
    return this.componentIdToEntityIdSet.get(componentId)?.has(entityId)
        ?? false
  }

  addComponentIds(entityId: number, componentIds: NonEmptyArray<ComponentId>): void {
    if (this.entityIds.has(entityId)) {
      let entityComponentsChanged = false
      for (const componentId of componentIds) {
        let entityIdSet = this.componentIdToEntityIdSet.get(componentId)
        if (!entityIdSet) {
          entityIdSet = new CleanSparseSet()
          this.componentIdToEntityIdSet.set(componentId, entityIdSet)
        }

        if (entityIdSet.add(entityId)) {
          entityComponentsChanged = true
        }
      }

      if (entityComponentsChanged) {
        this.emit(NonRecyclableWorldEvent.EntityComponentIdsChanged, entityId)
      }
    }
  }

  removeComponentIds(
    entityId: number
  , componentIds: NonEmptyArray<ComponentId>
  ): void {
    if (this.entityIds.has(entityId)) {
      let entityComponentsChanged = false
      for (const componentId of componentIds) {
        if (this.componentIdToEntityIdSet.get(componentId)?.delete(entityId)) {
          entityComponentsChanged = true
        }
      }

      if (entityComponentsChanged) {
        this.emit(NonRecyclableWorldEvent.EntityComponentIdsChanged, entityId)
      }
    }
  }
}
