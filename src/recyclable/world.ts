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
      return entityId
    } else {
      const entityId = this.nextEntityId++
      this.entityIds.add(entityId)
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
      const newAddedComponentIds: ComponentId[] = componentIds
        .filter(componentId => {
          let entityIdSet = this.componentIdToEntityIdSet.get(componentId)
          if (!entityIdSet) {
            entityIdSet = new CleanSparseSet()
            this.componentIdToEntityIdSet.set(componentId, entityIdSet)
          }

          return entityIdSet.add(entityId)
        })

      if (newAddedComponentIds.length) {
        this.emit(
          RecyclableWorldEvent.EntityComponentsChanged
        , entityId, newAddedComponentIds
        )
      }
    }
  }

  removeComponentIds(
    entityId: number
  , componentIds: NonEmptyArray<ComponentId>
  ): void {
    if (this.entityIds.has(entityId)) {
      const newRemovedComponentIds: ComponentId[] = componentIds
        .filter(componentId => this.componentIdToEntityIdSet.get(componentId)
                                                           ?.delete(entityId))

      if (newRemovedComponentIds.length) {
        this.emit(
          RecyclableWorldEvent.EntityComponentsChanged
        , entityId, newRemovedComponentIds
        )
      }
    }
  }
}
