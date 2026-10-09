import { NonEmptyArray } from '@blackglory/prelude'
import { CleanSparseMap, CleanSparseSet, Emitter } from '@blackglory/structures'

export enum RecyclableWorldEvent {
  EntityRemoved
, EntityComponentsChanged
}

// World本质上是一个内存数据库管理系统.
export class RecyclableWorld<ComponentId extends number> extends Emitter<{
  [RecyclableWorldEvent.EntityRemoved]: [entityId: number]
  [RecyclableWorldEvent.EntityComponentsChanged]: [
    entityId: number
  , changedComponentIds: ComponentId[]
  ]
}> {
  private nextEntityId: number = 0
  private recycledEntityIds: number[] = []
  private entityIdToComponentIdSet: CleanSparseMap<CleanSparseSet> = new CleanSparseMap()

  findAllEntityIds(): IterableIterator<number> {
    return this.entityIdToComponentIdSet.keys()
  }

  hasEntityId(entityId: number): boolean {
    return entityId < this.nextEntityId
        && this.entityIdToComponentIdSet.has(entityId)
  }

  createEntityId(): number {
    const entityId = this.recycledEntityIds.pop()
    if (entityId !== undefined) {
      this.entityIdToComponentIdSet.set(entityId, new CleanSparseSet())
      return entityId
    } else {
      const entityId = this.nextEntityId++
      this.entityIdToComponentIdSet.set(entityId, new CleanSparseSet())
      return entityId
    }
  }

  removeEntityId(entityId: number): void {
    if (this.entityIdToComponentIdSet.delete(entityId)) {
      this.recycledEntityIds.push(entityId)

      this.emit(RecyclableWorldEvent.EntityRemoved, entityId)
    }
  }

  * findComponentIds(entityId: number): IterableIterator<ComponentId> {
    const componentIds = this.entityIdToComponentIdSet.get(entityId)
    if (componentIds) {
      yield* componentIds.values() as IterableIterator<ComponentId>
    }
  }

  hasComponentId(entityId: number, componentId: ComponentId): boolean {
    return this.entityIdToComponentIdSet.get(entityId)?.has(componentId)
        ?? false
  }

  addComponentIds(
    entityId: number
  , componentIds: NonEmptyArray<ComponentId>
  ): void {
    const componentIdSet = this.entityIdToComponentIdSet.get(entityId)
    if (componentIdSet) {
      const newAddedComponentIds: ComponentId[] = componentIds
        .filter(componentId => componentIdSet.add(componentId))

      if (newAddedComponentIds.length) {
        this.emit(RecyclableWorldEvent.EntityComponentsChanged, entityId, newAddedComponentIds)
      }
    }
  }

  removeComponentIds(
    entityId: number
  , componentIds: NonEmptyArray<ComponentId>
  ): void {
    const componentIdSet = this.entityIdToComponentIdSet.get(entityId)
    if (componentIdSet) {
      const newRemovedComponentIds: ComponentId[] = componentIds
        .filter(componentId => componentIdSet.delete(componentId))

      if (newRemovedComponentIds.length) {
        this.emit(RecyclableWorldEvent.EntityComponentsChanged, entityId, newRemovedComponentIds)
      }
    }
  }
}
