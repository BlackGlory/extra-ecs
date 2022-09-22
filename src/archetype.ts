import { map, first, reduce } from 'iterable-operator'
import { StructureOfSparseMaps } from 'structure-of-arrays'
import { Component, ComponentId } from './component'
import { EntityId } from './entity-id'
import { World } from './world'
import { BitSet } from '@blackglory/structures'

export type ArchetypeId = bigint

export const EmptyArchetypeId = 0n

/**
 * 原型的本质是`Set<Component>`.
 */
export class Archetype {
  readonly id: ArchetypeId
  // 注意: 只有标记作用的component不会有storage.
  private readonly componentIdToStorage: Map<
    ComponentId
  , StructureOfSparseMaps<any>
  > = new Map()
  private entityIdSet = new BitSet()

  constructor(
    world: World
  , private componentSet: Set<Component>
  ) {
    for (const component of componentSet) {
      if (component.structure) {
        const storage = new StructureOfSparseMaps<any>(component.structure)
        this.componentIdToStorage.set(component.id, storage)
      }
    }

    const componentIdSet = new Set(
      map(componentSet, component => component.id)
    )

    this.id = computeArchetypeId(componentIdSet)
    world._archetypeRegistry.addArchetype(this)
    world.emit('newArchetypeAdded', this)
  }

  getAllComponents(): Iterable<Component> {
    return this.componentSet
  }

  hasComponent(component: Component): boolean {
    return this.componentSet.has(component)
  }

  hasComponents(components: Iterable<Component>): Iterable<boolean> {
    return map(components, component => this.hasComponent(component))
  }

  addEntity(entityId: number): void {
    this.entityIdSet.add(entityId)
    for (const storage of this.componentIdToStorage.values()) {
      storage.upsert(entityId)
    }
  }

  getEntityIds(): IterableIterator<EntityId> {
    return this.entityIdSet.values()
  }

  // 只有在entityId具有非标记作用的component时, 该方法才会返回相应的entityId.
  // 该方法保证返回的entityId数组和SoA的正向访问顺序相同.
  * getEntityIdsForStorageTraversal(): IterableIterator<EntityId> {
    const storage = first(this.componentIdToStorage.values())
    if (storage) {
      yield* storage.indexes()
    }
  }

  removeEntity(entityId: number): void {
    this.entityIdSet.delete(entityId)
    for (const soa of this.componentIdToStorage.values()) {
      soa.delete(entityId)
    }
  }

  getStorage(component: Component): StructureOfSparseMaps<any> | undefined {
    return this.componentIdToStorage.get(component.id)
  }
}

export function computeArchetypeId(
  componentIdSet: Set<ComponentId>
): ArchetypeId {
  return reduce(componentIdSet, (acc, cur) => acc + cur, 0n)
}

export function copyEntityData(
  entityId: EntityId
, source: Archetype
, target: Archetype
): void {
  for (const component of target.getAllComponents()) {
    const targetStorage = target.getStorage(component)
    if (targetStorage) {
      // 如果entity在archetype里存在, 则必将分配到一个internalIndex
      const targetIndex = targetStorage.getInternalIndex(entityId)!

      const sourceStorage = source.getStorage(component)
      if (sourceStorage) {
        const sourceIndex = sourceStorage.getInternalIndex(entityId)
        for (const key of sourceStorage.keys) {
          const value = sourceStorage.arrays[key][sourceIndex]
          targetStorage.arrays[key][targetIndex] = value
        }
      }
    }
  }
}
