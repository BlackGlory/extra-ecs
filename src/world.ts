import { go, assert, NonEmptyArray, isUndefined } from '@blackglory/prelude'
import { MapProps } from 'hotypes'
import { Emitter } from '@blackglory/structures'
import { StructureOfArrays, Structure, StructurePrimitive } from 'structure-of-arrays'
import { toArray, first } from 'iterable-operator'

/**
 * 世界的本质是一个内存数据库管理系统.
 */
export class World extends Emitter<{
  entityComponentsChanged: [entityId: number, components: Array<StructureOfArrays<any>>]
}> {
  private nextEntityId: number = 0
  private deletedEntityIds = new Set<number>()
  private entityIdToComponentSet: Map<number, Set<StructureOfArrays<any>>> = new Map()

  ;* getAllEntityIds(): Iterable<number> {
    for (let entityId = 0; entityId < this.nextEntityId; entityId++) {
      if (!this.deletedEntityIds.has(entityId)) {
        yield entityId
      }
    }
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
    this.entityIdToComponentSet.delete(entityId)
    this.deletedEntityIds.add(entityId)
  }

  componentsExist<T extends NonEmptyArray<StructureOfArrays<any>>>(
    entityId: number
  , ...components: NonEmptyArray<StructureOfArrays<any>>
  ): MapProps<T, boolean> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    if (componentSet) {
      const results = components.map(component => componentSet.has(component))
      return results as MapProps<T, boolean>
    } else {
      return new Array(components.length).fill(false) as MapProps<T, boolean>
    }
  }

  getComponents(entityId: number): Iterable<StructureOfArrays<any>> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    return componentSet
         ? toArray(componentSet)
         : []
  }

  addComponents<T extends Structure>(
    entityId: number
  , ...componentValuePairs: NonEmptyArray<
      [component: StructureOfArrays<T>, value: StructurePrimitive<T>]
    >
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const newAddedComponents: Array<StructureOfArrays<T>> = []
    const componentSet = go(() => {
      const componentSet = this.entityIdToComponentSet.get(entityId)
      if (componentSet) {
        return componentSet
      } else {
        const componentSet: Set<StructureOfArrays<any>> = new Set()
        this.entityIdToComponentSet.set(entityId, componentSet)
        return componentSet
      }
    })

    for (const [component, value] of componentValuePairs) {
      if (componentSet.has(component)) {
        component.upsert(entityId, value)
      } else {
        componentSet.add(component)
        component.upsert(entityId, value)
        newAddedComponents.push(component)
      }
    }

    if (newAddedComponents.length > 0) {
      this.emit('entityComponentsChanged', entityId, newAddedComponents)
    }
  }

  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<StructureOfArrays<T>>
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    if (componentSet) {
      let changed = false
      for (const component of components) {
        changed ||= componentSet.delete(component)
      }

      if (changed) {
        this.emit('entityComponentsChanged', entityId, components)
      }
    }
  }
}
