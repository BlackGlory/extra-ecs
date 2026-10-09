import { NonEmptyArray } from '@blackglory/prelude'
import { Emitter, CleanSparseMap, CleanSparseSet } from '@blackglory/structures'

export enum NonRecyclableWorldEvent {
  EntityRemoved
, EntityComponentsChanged
}

// World本质上是一个内存数据库管理系统.
export class NonRecyclableWorld<ComponentId extends number> extends Emitter<{
  [NonRecyclableWorldEvent.EntityRemoved]: [entityId: number]
  [NonRecyclableWorldEvent.EntityComponentsChanged]: [
    entityId: number
  , changedComponentIds: ComponentId[]
  ]
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
          NonRecyclableWorldEvent.EntityComponentsChanged
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
          NonRecyclableWorldEvent.EntityComponentsChanged
        , entityId, newRemovedComponentIds
        )
      }
    }
  }
}
