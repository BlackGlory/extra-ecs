import { go, assert, NonEmptyArray } from '@blackglory/prelude'
import { Emitter } from '@blackglory/structures'
import { Structure, MapTypesOfStructureToPrimitives } from 'structure-of-arrays'
import { map, includes, filter, toSet } from 'iterable-operator'
import { Component } from './component'
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
      const componentSet = toSet(
        map(
          componentValuePairs
        , ([component]) => component
        )
      )
      const oldArchetype = this._entityArchetypeRegistry.getArchetype(entityId)
      if (oldArchetype) {
        // entity已经有一个archetype, 意味着该entity不是第一次增减component

        if (includes(oldArchetype.hasComponents(componentSet), false)) {
          // 并非所有新component已经在archtype里, 需要变更enttiy对应的archetype

          const archetype = go(() => {
            const newComponentSet = toSet([
              ...oldArchetype.getAllComponents()
            , ...componentSet
            ])
            const newArchetypeId = computeArchetypeId(
              toSet(map(newComponentSet, component => component.id))
            )
            const achetype = this._archetypeRegistry.getArchtype(newArchetypeId)
            if (achetype) {
              return achetype
            } else {
              const newArchetype = new Archetype(this, newComponentSet)
              this._archetypeRegistry.addArchetype(newArchetype)
              this.emit('newArchetypeAdded', newArchetype)
              return newArchetype
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
          const archetypeId = computeArchetypeId(
            toSet(map(componentSet, component => component.id))
          )
          const archetype = this._archetypeRegistry.getArchtype(archetypeId)
          if (archetype) {
            return archetype
          } else {
            const newArchetype = new Archetype(this, componentSet)
            this._archetypeRegistry.addArchetype(newArchetype)
            this.emit('newArchetypeAdded', newArchetype)
            return newArchetype
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
          for (const [key, val] of Object.entries(value)) {
            storage.arrays[key][entityId] = val
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

        const componentSet = toSet(components)
        if (
          includes(oldArchetype.hasComponents(componentSet), true)
        ) {
          // 需要被删除的component在archetype里存在, 需要变更enttiy对应的archetype

          const newArchetype = go(() => {
            const newComponentSet = toSet(filter(
              oldArchetype.getAllComponents()
            , component => !includes(components, component)
            ))
            const newArchetypeId = computeArchetypeId(
              toSet(map(newComponentSet, component => component.id))
            )
            const archetype = this._archetypeRegistry.getArchtype(newArchetypeId)
            if (archetype) {
              return archetype
            } else {
              const newArchetype = new Archetype(this, newComponentSet)
              this._archetypeRegistry.addArchetype(newArchetype)
              this.emit('newArchetypeAdded', newArchetype)
              return newArchetype
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
          const newArchetype = this._archetypeRegistry.getArchtype(newArchetypeId)
          if (newArchetype) {
            return newArchetype
          } else {
            const newArchetype = new Archetype(this, new Set())
            this._archetypeRegistry.addArchetype(newArchetype)
            this.emit('newArchetypeAdded', newArchetype)
            return newArchetype
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
