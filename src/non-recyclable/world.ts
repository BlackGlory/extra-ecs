import { NonEmptyArray } from '@blackglory/prelude'
import { Emitter, CleanSparseMap, CleanSparseSet } from '@blackglory/structures'
import { ComponentId } from '@src/component.js'

export enum NonRecylableWorldEvent {
  EntityRemoved
, EntityComponentsChanged
}

// World本质上是一个内存数据库管理系统.
export class NonRecyclableWorld extends Emitter<{
  [NonRecylableWorldEvent.EntityRemoved]: [entityId: number]
  [NonRecylableWorldEvent.EntityComponentsChanged]: [
    entityId: number
  , changedComponentIds: ComponentId[]
  ]
}> {
  private nextEntityId: number = 0
  private entityIdToComponentIdSet: CleanSparseMap<CleanSparseSet> = new CleanSparseMap()

  findAllEntityIds(): IterableIterator<number> {
    return this.entityIdToComponentIdSet.keys()
  }

  hasEntityId(entityId: number): boolean {
    return entityId < this.nextEntityId
        && this.entityIdToComponentIdSet.has(entityId)
  }

  createEntityId(): number {
    const id = this.nextEntityId++
    this.entityIdToComponentIdSet.set(id, new CleanSparseSet())
    return id
  }

  removeEntityId(entityId: number): void {
    if (this.entityIdToComponentIdSet.delete(entityId)) {
      this.emit(NonRecylableWorldEvent.EntityRemoved, entityId)
    }
  }

  * findComponentIds(entityId: number): IterableIterator<ComponentId> {
    const componentIds = this.entityIdToComponentIdSet.get(entityId)
    if (componentIds) {
      yield* componentIds.values()
    }
  }

  hasComponentId(entityId: number, componentId: ComponentId): boolean {
    return this.entityIdToComponentIdSet.get(entityId)?.has(componentId)
        ?? false
  }

  addComponentIds(entityId: number, componentIds: NonEmptyArray<ComponentId>): void {
    const componentIdSet = this.entityIdToComponentIdSet.get(entityId)
    if (componentIdSet) {
      const newAddedComponentIds: ComponentId[] = componentIds
        .filter(componentId => componentIdSet.add(componentId))

      if (newAddedComponentIds.length) {
        this.emit(NonRecylableWorldEvent.EntityComponentsChanged, entityId, newAddedComponentIds)
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
        .filter(component => componentIdSet.delete(component))

      if (newRemovedComponentIds.length) {
        this.emit(NonRecylableWorldEvent.EntityComponentsChanged, entityId, newRemovedComponentIds)
      }
    }
  }
}
