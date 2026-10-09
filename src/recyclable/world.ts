import { NonEmptyArray } from '@blackglory/prelude'
import { CleanSparseMap, CleanSparseSet, Emitter } from '@blackglory/structures'

export enum RecyclableWorldEvent {
  EntityAdded
, EntityRemoved
, EntityComponentsChanged
}

// World本质上是一个内存数据库管理系统.
export class RecyclableWorld<ComponentId extends number> extends Emitter<{
  [RecyclableWorldEvent.EntityAdded]: [entityId: number]
  [RecyclableWorldEvent.EntityRemoved]: [entityId: number]
  [RecyclableWorldEvent.EntityComponentsChanged]: [entityId: number]
}> {
  private nextEntityId: number = 0
  private entityIds: CleanSparseSet = new CleanSparseSet()
  private componentIdToEntityIdSet: CleanSparseMap<CleanSparseSet> = new CleanSparseMap()
  private recycledEntityIds: number[] = []

  findAllEntityIds(): IterableIterator<number> {
    return this.entityIds.values()
  }

  hasEntityId(entityId: number): boolean {
    return this.entityIds.has(entityId)
  }

  createEntityId(): number {
    const entityId = this.recycledEntityIds.pop()
    if (entityId !== undefined) {
      this.entityIds.add(entityId)

      this.emit(RecyclableWorldEvent.EntityAdded, entityId)

      return entityId
    } else {
      const entityId = this.nextEntityId++
      this.entityIds.add(entityId)

      this.emit(RecyclableWorldEvent.EntityAdded, entityId)

      return entityId
    }
  }

  removeEntityId(entityId: number): void {
    if (this.entityIds.delete(entityId)) {
      this.recycledEntityIds.push(entityId)

      for (const entityIdSet of this.componentIdToEntityIdSet.values()) {
        entityIdSet.delete(entityId)
      }

      this.emit(RecyclableWorldEvent.EntityRemoved, entityId)
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

  addComponentIds(
    entityId: number
  , componentIds: NonEmptyArray<ComponentId>
  ): void {
    if (this.entityIds.has(entityId)) {
      let entityComponentsChanged = false
      for (const componentId of componentIds) {
        let entityIdSet = this.componentIdToEntityIdSet.get(componentId)
        if (!entityIdSet) {
          entityIdSet = new CleanSparseSet()
          this.componentIdToEntityIdSet.set(componentId, entityIdSet)
        }

        if (entityIdSet.add(entityId)) entityComponentsChanged = true
      }

      if (entityComponentsChanged) {
        this.emit(RecyclableWorldEvent.EntityComponentsChanged, entityId)
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
        this.emit(RecyclableWorldEvent.EntityComponentsChanged, entityId)
      }
    }
  }
}
