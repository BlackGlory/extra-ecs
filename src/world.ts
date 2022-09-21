import { assert, NonEmptyArray, isUndefined, isSymbol } from '@blackglory/prelude'
import { MapAllProps, Equals } from 'hotypes'
import { Falsy } from 'justypes'
import { Emitter, BitSet } from '@blackglory/structures'
import {
  StructureOfArrays
, Structure
, MapTypesOfStructureToPrimitives
} from 'structure-of-arrays'
import { toArray, first } from 'iterable-operator'
import { Component } from './component'

type MapComponentsToComponentValuePairs<T extends Array<Structure | Falsy>> = {
  [Index in keyof T]:
    Array<T[Index]> extends Array<infer U> // 使T[Index]成为一个变量, 从而让TypeScript正确跟踪其类型
    ? (
        U extends Structure
        ? (
            Equals<U, {}> extends true
            ? [component: Component<U>]
            : [component: Component<U>, value?: MapTypesOfStructureToPrimitives<U>]
          )
        : Falsy
      )
    : never
}

/**
 * 世界的本质是一个内存数据库管理系统.
 */
export class World extends Emitter<{
  entityRemoved: [entityId: number]
  entityComponentsChanged: [entityId: number, changedComponents: Component[]]
}> {
  private nextEntityId: number = 0
  private deletedEntityIds: BitSet = new BitSet()
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
    if (this.hasEntityId(entityId)) {
      const componentSet = this.entityIdToComponentSet.get(entityId)
      if (componentSet) {
        for (const component of componentSet) {
          if (component instanceof StructureOfArrays) {
            component.delete(entityId)
          }
        }

        this.entityIdToComponentSet.delete(entityId)
      }

      this.deletedEntityIds.add(entityId)
      this.emit('entityRemoved', entityId)
    }
  }

  componentsExist<T extends NonEmptyArray<Component>>(
    entityId: number
  , ...components: T
  ): MapAllProps<T, boolean> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    if (componentSet) {
      const results = components.map(component => componentSet.has(component))
      return results as MapAllProps<T, boolean>
    } else {
      return new Array(components.length).fill(false) as MapAllProps<T, boolean>
    }
  }

  getComponents(entityId: number): Iterable<Component> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    return componentSet
         ? toArray(componentSet)
         : []
  }

  addComponents<T extends NonEmptyArray<Structure | Falsy>>(
    entityId: number
  , ...componentValuePairs: MapComponentsToComponentValuePairs<T>
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.getComponentSet(entityId)
    const newAddedComponents: Component[] = []
    componentValuePairs.forEach(pair => {
      if (pair) {
        const [component, value] = pair
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
    })

    if (newAddedComponents.length > 0) {
      this.emit('entityComponentsChanged', entityId, newAddedComponents)
    }
  }

  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<Component<T> | Falsy>
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.getComponentSet(entityId)
    if (componentSet) {
      const removedComponents: Component[] = []
      components.forEach(component => {
        if (component) {
          if (componentSet.delete(component)) {
            removedComponents.push(component)
          }
        }
      })

      if (removedComponents.length) {
        this.emit('entityComponentsChanged', entityId, removedComponents)
      }
    }
  }

  private getComponentSet(entityId: number): Set<Component> {
    const componentSet = this.entityIdToComponentSet.get(entityId)
    if (componentSet) {
      return componentSet
    } else {
      const componentSet: Set<Component> = new Set()
      this.entityIdToComponentSet.set(entityId, componentSet)
      return componentSet
    }
  }
}
