import {
  go
, assert
, NonEmptyArray
, isUndefined
, isSymbol
} from '@blackglory/prelude'
import { MapProps } from 'hotypes'
import { Emitter } from '@blackglory/structures'
import { Structure, MapTypesOfStructureToPrimitives } from 'structure-of-arrays'
import { toArray, first } from 'iterable-operator'
import { Component } from './component'

/**
 * 世界的本质是一个内存数据库管理系统.
 */
export class World extends Emitter<{
  entityComponentsChanged: [entityId: number, components: Component[]]
}> {
  private nextEntityId: number = 0
  private deletedEntityIds: Set<number> = new Set()
  private entityIdToComponentSet: Map<number, Set<Component>> = new Map()

  ;* getAllEntityIds(): Iterable<number> {
    for (let entityId = 0; entityId < this.nextEntityId; entityId++) {
      if (!this.deletedEntityIds.has(entityId)) {
        yield entityId
      }
    }
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

  hasEntityId(entityId: number): boolean {
    return entityId < this.nextEntityId
        && !this.deletedEntityIds.has(entityId)
  }

  removeEntityId(entityId: number): void {
    this.entityIdToComponentSet.delete(entityId)
    this.deletedEntityIds.add(entityId)
  }

  componentsExist<T extends NonEmptyArray<Component>>(
    entityId: number
  , ...components: T
  ): MapProps<T, boolean> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    if (componentSet) {
      const results = components.map(component => {
        return componentSet.has(component)
      })
      return results as MapProps<T, boolean>
    } else {
      return new Array(components.length).fill(false) as MapProps<T, boolean>
    }
  }

  getComponents(entityId: number): Iterable<Component> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    return componentSet
         ? toArray(componentSet)
         : []
  }

  addComponents<T extends Structure>(
    entityId: number
  , ...componentValuePairs: NonEmptyArray<
      [component: Component<T>, value?: MapTypesOfStructureToPrimitives<T>]
    >
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = go(() => {
      const componentSet = this.entityIdToComponentSet.get(entityId)
      if (componentSet) {
        return componentSet
      } else {
        const componentSet: Set<Component> = new Set()
        this.entityIdToComponentSet.set(entityId, componentSet)
        return componentSet
      }
    })

    const newAddedComponents: Component[] = []
    for (const componentValuePair of componentValuePairs) {
      const [component, value] = componentValuePair

      if (isSymbol(component)) {
        componentSet.add(component)
        newAddedComponents.push(component)
      } else {
        if (componentSet.has(component)) {
          component.upsert(entityId, value)
        } else {
          componentSet.add(component)
          component.upsert(entityId, value)
          newAddedComponents.push(component)
        }
      }
    }

    if (newAddedComponents.length > 0) {
      this.emit('entityComponentsChanged', entityId, newAddedComponents)
    }
  }

  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<Component<T>>
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    if (componentSet) {
      const removedComponents: Component[] = []
      for (const component of components) {
        if (componentSet.delete(component)) {
          removedComponents.push(component)
        }
      }

      if (removedComponents.length) {
        this.emit('entityComponentsChanged', entityId, components)
      }
    }
  }
}
