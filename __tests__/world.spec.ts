import { World } from '@src/world'
import { Component, int8 } from '@src/component'
import { EmptyArchetypeId } from '@src/archetype'
import { toArray } from 'iterable-operator'
import '@blackglory/jest-matchers'

describe('World', () => {
  test('createEntityId', () => {
    const world = new World()

    const result1 = world.createEntityId()
    const result2 = world.createEntityId()

    expect(result1).toBe(0)
    expect(result2).toBe(1)
    expect(world._entityRegistry.hasEntityId(result1)).toBe(true)
    expect(world._entityRegistry.hasEntityId(result2)).toBe(true)
  })

  describe('removeEntityId', () => {
    test('exists', () => {
      const world = new World()
      const entityId = world.createEntityId()

      world.removeEntityId(entityId)

      expect(world._entityRegistry.hasEntityId(entityId)).toBe(false)
    })

    test('does not exist', () => {
      const world = new World()

      world.removeEntityId(0)

      expect(world._entityRegistry.hasEntityId(0)).toBe(false)
    })
  })

  describe('addComponents', () => {
    describe('empty structure', () => {
      test('exists', () => {
        const world = new World()
        const component = new Component(world)
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component])

        world.addComponents(entityId, [component])

        const componentId = world._componentRegistry.getComponentId(component)
        const archetype = world._archetypeRegistry.getArchtype(componentId)!
        expect(world._archetypeRegistry.hasArchetype(componentId)).toBe(true)
        expect(toArray(archetype.getAllComponents())).toStrictEqual([component])
        expect(component.arrays.id).toBe(undefined)
      })

      test('does not exist', () => {
        const world = new World()
        const component = new Component(world)
        const entityId = world.createEntityId()

        world.addComponents(entityId, [component])

        const componentId = world._componentRegistry.getComponentId(component)
        const archetype = world._archetypeRegistry.getArchtype(componentId)!
        expect(toArray(archetype.getAllComponents())).toStrictEqual([component])
        expect(component.arrays.id).toBe(undefined)
      })
    })

    describe('non-empty structure', () => {
      test('exists', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component, { value: 1 }])

        world.addComponents(entityId, [component, { value: 2 }])

        const componentId = world._componentRegistry.getComponentId(component)
        const archetype = world._archetypeRegistry.getArchtype(componentId)!
        expect(toArray(archetype.getAllComponents())).toStrictEqual([component])
        expect(component.arrays.value[entityId]).toBe(2)
      })

      test('does not exist', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const entityId = world.createEntityId()

        world.addComponents(entityId, [component, { value: 2 }])

        const componentId = world._componentRegistry.getComponentId(component)
        const archetype = world._archetypeRegistry.getArchtype(componentId)!
        expect(toArray(archetype.getAllComponents())).toStrictEqual([component])
        expect(component.arrays.value[entityId]).toBe(2)
      })
    })
  })

  describe('removeComponents', () => {
    describe('empty structure', () => {
      test('does not exist', () => {
        const world = new World()
        const component = new Component(world)
        const entityId = world.createEntityId()

        world.removeComponents(entityId, component)

        const archetype = world._entityArchetypeRegistry.getArchetype(entityId)!
        expect(archetype.id).toBe(EmptyArchetypeId)
      })

      test('exists', () => {
        const world = new World()
        const component = new Component(world)
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component])

        world.removeComponents(entityId, component)

        const componentId = world._componentRegistry.getComponentId(component)
        const archetype = world._archetypeRegistry.getArchtype(componentId)!
        expect(toArray(archetype.getEntityIds())).toStrictEqual([])
        const newArchetype = world._entityArchetypeRegistry.getArchetype(entityId)!
        expect(newArchetype.id).toBe(EmptyArchetypeId)
      })
    })

    describe('non-empty structure', () => {
      test('does not exist', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const entityId = world.createEntityId()

        world.removeComponents(entityId, component)

        const newArchetype = world._entityArchetypeRegistry.getArchetype(entityId)!
        expect(newArchetype.id).toBe(EmptyArchetypeId)
      })

      test('exists', () => {
        const world = new World()
        const component = new Component(world, { value: int8 })
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component, { value: 1 }])

        world.removeComponents(entityId, component)

        const componentId = world._componentRegistry.getComponentId(component)
        const archetype = world._archetypeRegistry.getArchtype(componentId)!
        expect(toArray(archetype.getEntityIds())).toStrictEqual([])
        const newArchetype = world._entityArchetypeRegistry.getArchetype(entityId)!
        expect(newArchetype.id).toBe(EmptyArchetypeId)
      })
    })
  })
})
