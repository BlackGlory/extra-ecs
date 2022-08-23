import { go, assert, NonEmptyArray, isUndefined, isSymbol } from '@blackglory/prelude'
import { MapProps } from 'hotypes'
import { Emitter } from '@blackglory/structures'
import { StructureOfArrays, Structure, MapStructureToPrimitive } from 'structure-of-arrays'
import { toArray, first, map } from 'iterable-operator'
import { Component, ComponentId, ComponentRegistry } from './component'

/**
 * 世界的本质是一个内存数据库管理系统.
 */
export class World extends Emitter<{
  entityComponentsChanged: [entityId: number, componentIds: ComponentId[]]
}> {
  private nextEntityId: number = 0
  private deletedEntityIds: Set<number> = new Set()
  private entityIdToComponentIdSet: Map<number, Set<ComponentId>> = new Map()
  readonly componentRegistry = new ComponentRegistry()

  ;* getAllEntityIds(): Iterable<number> {
    for (let entityId = 0; entityId < this.nextEntityId; entityId++) {
      if (!this.deletedEntityIds.has(entityId)) {
        yield entityId
      }
    }
  }

  getComponentIndex(entityId: number, component: Component): number {
    return entityId
  }

  hasEntityId(entityId: number): boolean {
    return entityId < this.nextEntityId
        && !this.deletedEntityIds.has(entityId)
  }

  /**
   * entityId是entity的主键, 与数据库主键不同, 该键可以被重用.
   */
  createEntityId(): number {
    const entityId = first(this.deletedEntityIds)
    if (isUndefined(entityId)) {
      return this.nextEntityId++
    } else {
      this.deletedEntityIds.delete(entityId)
      return entityId
    }
  }

  removeEntityId(entityId: number): void {
    this.entityIdToComponentIdSet.delete(entityId)
    this.deletedEntityIds.add(entityId)
  }

  componentsExist<T extends NonEmptyArray<Component>>(
    entityId: number
  , ...components: T
  ): MapProps<T, boolean> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentIdSet = this.entityIdToComponentIdSet.get(entityId)
    if (componentIdSet) {
      const results = components.map(component => {
        return componentIdSet.has(this.componentRegistry.getId(component))
      })
      return results as MapProps<T, boolean>
    } else {
      return new Array(components.length).fill(false) as MapProps<T, boolean>
    }
  }

  getComponents(entityId: number): Iterable<Component> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentIdSet = this.entityIdToComponentIdSet.get(entityId)
    return componentIdSet
         ? toArray(
             map(
               componentIdSet
             , id => this.componentRegistry.getComponent(id)!
             )
           )
         : []
  }

  addComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<
    | [array: StructureOfArrays<T>, value: MapStructureToPrimitive<T>]
    | symbol
    >
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentIdSet = go(() => {
      const componentIdSet = this.entityIdToComponentIdSet.get(entityId)
      if (componentIdSet) {
        return componentIdSet
      } else {
        const componentIdSet: Set<ComponentId> = new Set()
        this.entityIdToComponentIdSet.set(entityId, componentIdSet)
        return componentIdSet
      }
    })

    const newAddedComponentIds: ComponentId[] = []
    for (const component of components) {
      if (isSymbol(component)) {
        const componentId = this.componentRegistry.getId(component)
        componentIdSet.add(componentId)
        newAddedComponentIds.push(componentId)
      } else {
        const [array, value] = component
        const componentId = this.componentRegistry.getId(array)
        if (componentIdSet.has(componentId)) {
          array.upsert(entityId, value)
        } else {
          componentIdSet.add(componentId)
          array.upsert(entityId, value)
          newAddedComponentIds.push(componentId)
        }
      }
    }

    if (newAddedComponentIds.length > 0) {
      this.emit('entityComponentsChanged', entityId, newAddedComponentIds)
    }
  }

  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<Component<T>>
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentIdSet = this.entityIdToComponentIdSet.get(entityId)
    if (componentIdSet) {
      let changed = false
      const componentIds: ComponentId[] = []
      for (const component of components) {
        const componentId = this.componentRegistry.getId(component)
        changed ||= componentIdSet.delete(componentId)
      }

      if (changed) {
        this.emit('entityComponentsChanged', entityId, componentIds)
      }
    }
  }
}
