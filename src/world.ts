import { go, assert, NonEmptyArray } from '@blackglory/prelude'
import { MapProps } from 'hotypes'
import { Emitter, SparseSet } from '@blackglory/structures'
import { StructureOfArrays, Structure, StructurePrimitive } from 'structure-of-arrays'
import { toArray } from 'iterable-operator'

/**
 * 世界的本质是一个内存数据库管理系统.
 */
export class World extends Emitter<{
  entityComponentsChanged: [entityId: number, components: Array<StructureOfArrays<any>>]
}> {
  private entityIds = new SparseSet()
  private nextEntityId: number = 0
  private entityIdToComponentSet: Map<number, Set<StructureOfArrays<any>>> = new Map()

  getAllEntityIds(): Iterable<number> {
    return this.entityIds
  }

  hasEntityId(entity: number): boolean {
    return this.entityIds.has(entity)
  }

  /**
   * entityId是entity的主键, 不会重用.
   */
  createEntityId(): number {
    const entityId = this.nextEntityId++
    this.entityIds.add(entityId)
    return entityId
  }

  removeEntityId(entityId: number): void {
    this.entityIds.remove(entityId)
    this.entityIdToComponentSet.delete(entityId)
  }

  getComponentIndexes<T extends NonEmptyArray<StructureOfArrays<any>>>(
    entityId: number
  , ...components: T
  ): MapProps<T, number | undefined> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    return components.map(component => {
      return componentSet?.has(component)
           ? entityId
           : undefined
    }) as MapProps<T, number | undefined>
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

    const components: Array<StructureOfArrays<T>> = []
    const componetSet = go(() => {
      const componentSet = this.entityIdToComponentSet.get(entityId)
      if (componentSet) {
        return componentSet
      } else {
        const componentSet: Set<StructureOfArrays<any>> = new Set()
        this.entityIdToComponentSet.set(entityId, componentSet)
        return componentSet
      }
    })

    let added = false
    for (const [component, value] of componentValuePairs) {
      componetSet.add(component)
      components.push(component)
      component.push(value)
      added = true
    }

    if (added) {
      this.emit('entityComponentsChanged', entityId, components)
    }
  }

  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<StructureOfArrays<T>>
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentSet = this.entityIdToComponentSet.get(entityId)
    if (componentSet) {
      let deleted = false
      for (const component of components) {
        deleted ||= componentSet.delete(component)
      }

      if (deleted) {
        this.emit('entityComponentsChanged', entityId, components)
      }
    }
  }
}
