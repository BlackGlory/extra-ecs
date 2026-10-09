import { NonEmptyArray } from '@blackglory/prelude'
import { CleanSparseSet, Emitter } from '@blackglory/structures'
import { first } from 'iterable-operator'

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
  private recycledEntityIds = new CleanSparseSet()
  private entityIdToComponentIdSet: Array<CleanSparseSet | undefined> = []

  ;* findAllEntityIds(): IterableIterator<number> {
    for (
      let entityId = 0
    ; entityId < this.entityIdToComponentIdSet.length
    ; entityId++
    ) {
      if (this.entityIdToComponentIdSet[entityId] !== undefined) yield entityId
    }
  }

  hasEntityId(entityId: number): boolean {
    return this.entityIdToComponentIdSet[entityId] !== undefined
  }

  createEntityId(): number {
    const entityId = first(this.recycledEntityIds.values())
    if (entityId !== undefined) {
      this.recycledEntityIds.delete(entityId)
      this.entityIdToComponentIdSet[entityId] = new CleanSparseSet()
      return entityId
    } else {
      const entityId = this.entityIdToComponentIdSet.length
      this.entityIdToComponentIdSet.push(new CleanSparseSet())
      return entityId
    }
  }

  removeEntityId(entityId: number): void {
    const componentIdSet = this.entityIdToComponentIdSet[entityId]
    if (componentIdSet) {
      this.entityIdToComponentIdSet[entityId] = undefined
      this.recycledEntityIds.add(entityId)

      this.emit(RecyclableWorldEvent.EntityRemoved, entityId)
    }
  }

  * findComponentIds(entityId: number): IterableIterator<ComponentId> {
    const componentIdSet = this.entityIdToComponentIdSet[entityId]
    if (componentIdSet) {
      yield* componentIdSet.values() as IterableIterator<ComponentId>
    }
  }

  hasComponentId(entityId: number, componentId: ComponentId): boolean {
    return this.entityIdToComponentIdSet[entityId]?.has(componentId)
        ?? false
  }

  addComponentIds(
    entityId: number
  , componentIds: NonEmptyArray<ComponentId>
  ): void {
    const componentIdSet = this.entityIdToComponentIdSet[entityId]
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
    const componentIdSet = this.entityIdToComponentIdSet[entityId]
    if (componentIdSet) {
      const newRemovedComponentIds: ComponentId[] = componentIds
        .filter(componentId => componentIdSet.delete(componentId))

      if (newRemovedComponentIds.length) {
        this.emit(RecyclableWorldEvent.EntityComponentsChanged, entityId, newRemovedComponentIds)
      }
    }
  }
}
