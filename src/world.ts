import { go, assert, isUndefined, NonEmptyArray } from '@blackglory/prelude'
import { MapProps } from 'hotypes'
import { Emitter, SparseSet } from '@blackglory/structures'
import { StructureOfArrays, Structure, StructurePrimitive } from 'structure-of-arrays'

/**
 * 世界的本质是一个内存数据库管理系统.
 */
export class World extends Emitter<{
  entityComponentsChanged: [entityId: number, components: Array<StructureOfArrays<any>>]
}> {
  private entityIds = new SparseSet()
  private nextEntityId: number = 0
  private entityIdToComponentToIndex: Map<
    number
  , Map<StructureOfArrays<any>, number>
  > = new Map()

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
    this.entityIdToComponentToIndex.delete(entityId)
  }

  getComponentIndexes<T extends NonEmptyArray<StructureOfArrays<any>>>(
    entityId: number
  , ...components: T
  ): MapProps<T, number | undefined> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentToIndex = this.entityIdToComponentToIndex.get(entityId)
    if (isUndefined(componentToIndex)) {
      return new Array(components.length) as MapProps<T, number>
    } else {
      const indexes: Array<number | undefined> = components.map(component => {
        return componentToIndex.get(component)
      })

      return indexes as MapProps<T, number | undefined>
    }
  }

  componentsExist<T extends NonEmptyArray<StructureOfArrays<any>>>(
    entityId: number
  , ...components: NonEmptyArray<StructureOfArrays<any>>
  ): MapProps<T, boolean> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentToIndex = this.entityIdToComponentToIndex.get(entityId)
    if (componentToIndex) {
      const results = components.map(component => componentToIndex.has(component))
      return results as MapProps<T, boolean>
    } else {
      return new Array(components.length).fill(false) as MapProps<T, boolean>
    }
  }

  getComponents(entityId: number): Iterable<StructureOfArrays<any>> {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const componentToIndex = this.entityIdToComponentToIndex.get(entityId)
    return componentToIndex ? componentToIndex.keys() : []
  }

  addComponents<T extends Structure>(
    entityId: number
  , ...componentValuePairs: NonEmptyArray<
      [component: StructureOfArrays<T>, value: StructurePrimitive<T>]
    >
  ): void {
    assert(this.hasEntityId(entityId), 'The entity does not exist')

    const components: Array<StructureOfArrays<T>> = []
    const componentToIndex = go(() => {
      const map = this.entityIdToComponentToIndex.get(entityId)
      if (map) {
        return map
      } else {
        const map = new Map<StructureOfArrays<T>, number>()
        this.entityIdToComponentToIndex.set(entityId, map)
        return map
      }
    })

    let added = false
    for (const [component, value] of componentValuePairs) {
      components.push(component)

      const index = componentToIndex.get(component)
      if (isUndefined(index)) {
        const [index] = component.add(value)
        componentToIndex.set(component, index)
        added = true
      } else {
        componentToIndex.set(component, index)
      }
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

    const componentToIndex = this.entityIdToComponentToIndex.get(entityId)
    if (componentToIndex) {
      let deleted = false
      for (const component of components) {
        deleted ||= componentToIndex.delete(component)
      }

      if (deleted) {
        this.emit('entityComponentsChanged', entityId, components)
      }
    }
  }
}
