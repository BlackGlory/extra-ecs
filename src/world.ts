import { go, assert, NonEmptyArray } from '@blackglory/prelude'
import { Emitter } from '@blackglory/structures'
import { Structure, MapTypesOfStructureToPrimitives } from 'structure-of-arrays'
import { map, each, includes, filter } from 'iterable-operator'
import { Component, ComponentId } from './component'
import { ComponentRegistry } from './component-registry'
import {
  Archetype
, ArchetypeId
, computeArchetypeId
, copyEntityData
, EmptyArchetypeId
} from './archetype'
import { EntityId } from './entity-id'
import { EntityIdRegistry } from './entity-id-registry'
import { ArchetypeRegistry } from './archetype-registry'
import { EntityArchetypeRegistry } from './entity-archetype-registry'

/**
 * 世界的本质是一个内存数据库管理系统.
 */
export class World extends Emitter<{
  newArchetypeAdded: [archetype: Archetype]
}> {
  _componentRegistry = new ComponentRegistry()
  _archetypeRegistry = new ArchetypeRegistry()
  _entityRegistry = new EntityIdRegistry()
  _entityArchetypeRegistry = new EntityArchetypeRegistry()

  createEntityId(): EntityId {
    return this._entityRegistry.createEntityId()
  }

  removeEntityId(entityId: EntityId): void {
    this._entityRegistry.removeEntityId(entityId)
    this._entityArchetypeRegistry.removeRelation(entityId)
  }

  addComponents<T extends Structure>(
    entityId: number
  , ...componentValuePairs: NonEmptyArray<
      [array: Component<T>, value?: MapTypesOfStructureToPrimitives<T>]
    >
  ): void {
    assert(this._entityRegistry.hasEntityId(entityId), 'The entity does not exist')

    // 创建或获取符合entity新形状的archetype.
    const archetype: Archetype = go(() => {
      const oldArchetype = this._entityArchetypeRegistry.getArchetype(entityId)
      if (oldArchetype) {
        // entity已经有一个archetype, 意味着该entity不是第一次增减component

        const componentSet = new Set(map(
          componentValuePairs
        , ([component]) => component
        ))
        if (includes(oldArchetype.hasComponents(componentSet), false)) {
          // 并非所有新component已经在archetype里, 需要变更enttiy对应的archetype

          const archetype = go(() => {
            const newComponentSet = new Set([
              ...oldArchetype.getAllComponents()
            , ...componentSet
            ])
            const newArchetypeId = computeArchetypeId(
              new Set(map(newComponentSet, component => component.id))
            )
            const achetype = this._archetypeRegistry.getArchetypee(newArchetypeId)
            if (achetype) {
              return achetype
            } else {
              return new Archetype(this, newComponentSet)
            }
          })
          archetype.addEntity(entityId)
          copyEntityData(entityId, oldArchetype, archetype)
          oldArchetype.removeEntity(entityId)
          this._entityArchetypeRegistry.setRelation(entityId, archetype)
          return archetype
        } else {
          // 需要被添加的component都已存在于archetype

          return oldArchetype
        }
      } else {
        // entity还没有archetype, 意味着该entity是第一次增减component

        const archetype = go(() => {
          const componentSet: Set<Component> = new Set()
          const componentIdSet: Set<ComponentId> = new Set()
          each(componentValuePairs, ([component]) => {
            componentSet.add(component)
            componentIdSet.add(component.id)
          })

          const newArchetypeId = computeArchetypeId(componentIdSet)
          const archetype = this._archetypeRegistry.getArchetypee(newArchetypeId)
          if (archetype) {
            return archetype
          } else {
            return new Archetype(this, componentSet)
          }
        })
        archetype.addEntity(entityId)
        this._entityArchetypeRegistry.setRelation(entityId, archetype)
        return archetype
      }
    })

    for (const [component, value] of componentValuePairs) {
      if (value) {
        const storage = archetype.getStorage(component)
        if (storage) {
          for (const key of storage.keys) {
            storage.arrays[key][entityId] = value[key]
          }
        }
      }
    }
  }

  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<Component<T>>
  ): void {
    assert(this._entityRegistry.hasEntityId(entityId), 'The entity does not exist')

    // 创建或获取符合entity新形状的archetype.
    const archetype: Archetype = go(() => {
      const oldArchetype = this._entityArchetypeRegistry.getArchetype(entityId)
      if (oldArchetype) {
        // entity已经有一个archetype, 意味着该entity不是第一次增减component

        const componentSet = new Set(components)
        if (
          includes(oldArchetype.hasComponents(componentSet), true)
        ) {
          // 需要被删除的component在archetype里存在, 需要变更enttiy对应的archetype

          const newArchetype = go(() => {
            const newComponentSet = new Set(filter(
              oldArchetype.getAllComponents()
            , component => !includes(components, component)
            ))
            const newArchetypeId = computeArchetypeId(
              new Set(map(newComponentSet, component => component.id))
            )
            const archetype = this._archetypeRegistry.getArchetypee(newArchetypeId)
            if (archetype) {
              return archetype
            } else {
              return new Archetype(this, newComponentSet)
            }
          })
          newArchetype.addEntity(entityId)
          copyEntityData(entityId, oldArchetype, newArchetype)
          oldArchetype.removeEntity(entityId)
          this._entityArchetypeRegistry.setRelation(entityId, newArchetype)
          return newArchetype
        } else {
          // 需要被删除的component都不存在于archetype

          return oldArchetype
        }
      } else {
        // entity还没有archetype, 意味着该entity是第一次增减component

        const newArchetype = go(() => {
          const newArchetypeId: ArchetypeId = EmptyArchetypeId
          const newArchetype = this._archetypeRegistry.getArchetypee(newArchetypeId)
          if (newArchetype) {
            return newArchetype
          } else {
            return new Archetype(this, new Set())
          }
        })
        newArchetype.addEntity(entityId)
        this._entityArchetypeRegistry.setRelation(entityId, newArchetype)
        return newArchetype
      }
    })

    for (const component of components) {
      const storage = archetype.getStorage(component)
      storage?.delete(entityId)
    }
  }
}
