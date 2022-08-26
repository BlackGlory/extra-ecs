import {
  Archetype
, computeArchetypeId
, EmptyArchetypeId
, copyEntityData
} from '@src/archetype'
import { StructureOfSparseMaps } from 'structure-of-arrays'
import { World } from '@src/world'
import { Component, int8 } from '@src/component'
import { toArray } from 'iterable-operator'
import '@blackglory/jest-matchers'

describe('Archetype', () => {
  test('EmptyArchetypeId', () => {
    const result = EmptyArchetypeId

    expect(result).toBe(0n)
  })

  describe('id', () => {
    test('non-empty components', () => {
      const world = new World()
      const component = new Component(world)
      const archetype = new Archetype(world, new Set([component]))

      const id = archetype.id

      expect(id).toBe(world._componentRegistry.getComponentId(component))
    })

    test('empty components', () => {
      const world = new World()
      const archetype = new Archetype(world, new Set())

      const id = archetype.id

      expect(id).toBe(EmptyArchetypeId)
    })
  })

  describe('getAllComponents', () => {
    test('empty components', () => {
      const world = new World()
      const archetype = new Archetype(world, new Set())

      const result = archetype.getAllComponents()
      const arrResult = toArray(result)

      expect(result).toBeIterable()
      expect(arrResult).toStrictEqual([])
    })

    test('non-empty components', () => {
      const world = new World()
      const component1 = new Component(world)
      const component2 = new Component(world)
      const archetype = new Archetype(world, new Set([component1, component2]))

      const result = archetype.getAllComponents()
      const arrResult = toArray(result)

      expect(result).toBeIterable()
      expect(arrResult).toStrictEqual([component1, component2])
    })
  })

  describe('hasComponent', () => {
    test('exists', () => {
      const world = new World()
      const component = new Component(world)
      const archetype = new Archetype(world, new Set([component]))

      const result = archetype.hasComponent(component)

      expect(result).toBe(true)
    })

    test('does not exist', () => {
      const world = new World()
      const component = new Component(world)
      const archetype = new Archetype(world, new Set([]))

      const result = archetype.hasComponent(component)

      expect(result).toBe(false)
    })
  })

  describe('hasComponents', () => {
    test('exists', () => {
      const world = new World()
      const component = new Component(world)
      const archetype = new Archetype(world, new Set([component]))

      const result = archetype.hasComponents([component])
      const arrResult = toArray(result)

      expect(result).toBeIterable()
      expect(arrResult).toStrictEqual([true])
    })

    test('does not exist', () => {
      const world = new World()
      const component = new Component(world)
      const archetype = new Archetype(world, new Set([]))

      const result = archetype.hasComponents([component])
      const arrResult = toArray(result)

      expect(result).toBeIterable()
      expect(arrResult).toStrictEqual([false])
    })
  })

  describe('addEntity', () => {
    test('exists', () => {
      const world = new World()
      const entityId = world.createEntityId()
      const component = new Component(world)
      const archetype = new Archetype(world, new Set([component]))
      archetype.addEntity(entityId)

      archetype.addEntity(entityId)

      expect(toArray(archetype.getEntityIds())).toStrictEqual([entityId])
    })

    test('does not exist', () => {
      const world = new World()
      const entityId = world.createEntityId()
      const component = new Component(world)
      const archetype = new Archetype(world, new Set([component]))

      archetype.addEntity(entityId)

      expect(toArray(archetype.getEntityIds())).toStrictEqual([entityId])
    })
  })

  describe('getEntityIds', () => {
    describe('empty structure', () => {
      test('empty storage', () => {
        const world = new World()
        const component = new Component(world)
        const archetype = new Archetype(world, new Set([component]))

        const result = archetype.getEntityIds()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([])
      })

      test('non-empty storage', () => {
        const world = new World()
        const component = new Component(world)
        const entityId = world.createEntityId()
        const archetype = new Archetype(world, new Set([component]))
        archetype.addEntity(entityId)

        const result = archetype.getEntityIds()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([entityId])
      })
    })

    describe('non-empty structure', () => {
      test('empty storage', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const archetype = new Archetype(world, new Set([component]))

        const result = archetype.getEntityIds()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([])
      })

      test('non-empty storage', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const entityId = world.createEntityId()
        const archetype = new Archetype(world, new Set([component]))
        archetype.addEntity(entityId)

        const result = archetype.getEntityIds()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([entityId])
      })
    })
  })

  describe('getEntityIdsForStorageTraversal', () => {
    describe('empty structure', () => {
      test('empty storage', () => {
        const world = new World()
        const component = new Component(world)
        const archetype = new Archetype(world, new Set([component]))

        const result = archetype.getEntityIdsForStorageTraversal()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([])
      })

      test('non-empty storage', () => {
        const world = new World()
        const component = new Component(world)
        const entityId = world.createEntityId()
        const archetype = new Archetype(world, new Set([component]))
        archetype.addEntity(entityId)

        const result = archetype.getEntityIdsForStorageTraversal()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([])
      })
    })

    describe('non-empty structure', () => {
      test('empty storage', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const archetype = new Archetype(world, new Set([component]))

        const result = archetype.getEntityIdsForStorageTraversal()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([])
      })

      test('non-empty storage', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const entityId = world.createEntityId()
        const archetype = new Archetype(world, new Set([component]))
        archetype.addEntity(entityId)

        const result = archetype.getEntityIdsForStorageTraversal()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([entityId])
      })

      test('returns entityIds in the same order as storage indexes', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const entityId1 = world.createEntityId() // 0
        const entityId2 = world.createEntityId() // 1
        const entityId3 = world.createEntityId() // 2
        const entityId4 = world.createEntityId() // 3
        const archetype = new Archetype(world, new Set([component]))
        archetype.addEntity(entityId1) // [entityId1]
        archetype.addEntity(entityId2) // [entityId1, entityId2]
        archetype.addEntity(entityId3) // [entityId1, entityId2, entityId3]
        archetype.removeEntity(entityId1) // [entityId3, entityId2]
        archetype.addEntity(entityId4) // [entityId3, entityId2, entityId4]

        const result = archetype.getEntityIdsForStorageTraversal()
        const arrResult = toArray(result)

        expect(result).toBeIterable()
        expect(arrResult).toStrictEqual([entityId3, entityId2, entityId4])
      })
    })
  })

  describe('removeEntity', () => {
    test('exists', () => {
      const world = new World()
      const entityId = world.createEntityId()
      const archetype = new Archetype(world, new Set([]))
      archetype.addEntity(entityId)

      archetype.removeEntity(entityId)

      expect(toArray(archetype.getEntityIds())).toStrictEqual([])
    })

    test('does not exist', () => {
      const world = new World()
      const entityId = world.createEntityId()
      const archetype = new Archetype(world, new Set([]))

      archetype.removeEntity(entityId)

      expect(toArray(archetype.getEntityIds())).toStrictEqual([])
    })
  })

  describe('getStorage', () => {
    test('component is not added', () => {
      const world = new World()
      const component = new Component(world, { value: int8 })
      const archetype = new Archetype(world, new Set([]))

      const result = archetype.getStorage(component)

      expect(result).toBe(undefined)
    })

    describe('component is added', () => {
      test('component with empty structure', () => {
        const world = new World()
        const component = new Component(world)
        const archetype = new Archetype(world, new Set([component]))

        const result = archetype.getStorage(component)

        expect(result).toBe(undefined)
      })

      test('component with non-empty structure', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const archetype = new Archetype(world, new Set([component]))

        const result = archetype.getStorage(component)

        expect(result).toBeInstanceOf(StructureOfSparseMaps)
      })
    })
  })
})

describe('computeArchetypeId', () => {
  test('empty', () => {
    const result = computeArchetypeId(new Set([]))

    expect(result).toBe(0n)
  })

  test('non-empty', () => {
    const result = computeArchetypeId(new Set([1n, 2n]))

    expect(result).toBe(3n)
  })
})

describe('copyEntityData', () => {
  test('target archetype has more components than source archetype', () => {
    const world = new World()
    const entityId = world.createEntityId()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })
    const sourceArchetype = new Archetype(world, new Set([component1]))
    sourceArchetype.addEntity(entityId)
    const sourceStorage = sourceArchetype.getStorage(component1)!
    const sourceIndex = sourceStorage.getInternalIndex(entityId)
    sourceStorage.arrays.value[sourceIndex] = 1
    const targetArchetype = new Archetype(world, new Set([component1, component2]))
    targetArchetype.addEntity(entityId)

    copyEntityData(entityId, sourceArchetype, targetArchetype)

    expect(sourceStorage.has(entityId)).toBe(true)
    expect(sourceStorage.get(entityId, 'value')).toBe(1)
    expect(targetArchetype.getStorage(component1)!.get(entityId, 'value')).toBe(1)
    expect(targetArchetype.getStorage(component2)!.get(entityId, 'value')).toBe(0)
  })

  test('target archetype has less components thane source archetype', () => {
    const world = new World()
    const entityId = world.createEntityId()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })
    const sourceArchetype = new Archetype(world, new Set([component1, component2]))
    sourceArchetype.addEntity(entityId)
    const sourceStorage1 = sourceArchetype.getStorage(component1)!
    const sourceStorage2 = sourceArchetype.getStorage(component2)!
    const sourceIndex = sourceStorage1.getInternalIndex(entityId)
    sourceStorage1.arrays.value[sourceIndex] = 1
    sourceStorage2.arrays.value[sourceIndex] = 2
    const targetArchetype = new Archetype(world, new Set([component1]))
    targetArchetype.addEntity(entityId)

    copyEntityData(entityId, sourceArchetype, targetArchetype)

    expect(sourceStorage1.has(entityId)).toBe(true)
    expect(sourceStorage1.get(entityId, 'value')).toBe(1)
    expect(sourceStorage2.has(entityId)).toBe(true)
    expect(sourceStorage2.get(entityId, 'value')).toBe(2)
    expect(targetArchetype.hasComponent(component2)).toBe(false)
    expect(targetArchetype.getStorage(component1)!.get(entityId, 'value')).toBe(1)
  })
})
