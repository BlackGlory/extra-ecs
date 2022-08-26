import { World } from '@src/world'
import { Component, int8 } from '@src/component'

describe('Component', () => {
  describe('structure', () => {
    test('undefined', () => {
      const world = new World()
      const component = new Component(world)

      const result = component.structure

      expect(result).toBe(undefined)
    })

    test('empty', () => {
      const world = new World()
      const component = new Component(world, {})

      const result = component.structure

      expect(result).toStrictEqual({})
    })

    test('non-empty', () => {
      const world = new World()
      const component = new Component(world, { value: int8 })

      const result = component.structure

      expect(result).toStrictEqual({ value: int8 })
    })
  })

  test('getValue', () => {
    const world = new World()
    const entityId1 = world.createEntityId()
    const entityId2 = world.createEntityId()
    const component = new Component(world, { value: int8 })
    world.addComponents(entityId1, [component, { value: 1 }])
    world.addComponents(entityId2, [component, { value: 2 }])

    const result1 = component.getValue(entityId1, 'value')
    const result2 = component.getValue(entityId2, 'value')

    expect(result1).toBe(1)
    expect(result2).toBe(2)
  })

  test('setValue', () => {
    const world = new World()
    const entityId1 = world.createEntityId()
    const entityId2 = world.createEntityId()
    const component = new Component(world, { value: int8 })
    world.addComponents(entityId1, [component, { value: 1 }])
    world.addComponents(entityId2, [component, { value: 2 }])

    component.setValue(entityId1, 'value', 10)
    component.setValue(entityId2, 'value', 20)

    const archetype = world._entityArchetypeRegistry.getArchetype(entityId1)!
    const storage = archetype.getStorage(component)!
    expect(storage.get(entityId1, 'value')).toBe(10)
    expect(storage.get(entityId2, 'value')).toBe(20)
  })
})
