import { ComponentRegistry } from '@src/component-registry'
import { World } from '@src/world'
import { Component } from '@src/component'

describe('ComponentRegistry', () => {
  describe('getComponentId', () => {
    test('exists', () => {
      const registry = new ComponentRegistry()
      const world = new World()
      const component = new Component(world)
      const componentId = registry.getComponentId(component)

      const result = registry.getComponentId(component)

      expect(result).toBe(componentId)
    })

    test('dose not exist', () => {
      const registry = new ComponentRegistry()
      const world = new World()
      const component = new Component(world)

      const result = registry.getComponentId(component)

      expect(result).toBe(1n)
    })
  })

  describe('getComponent', () => {
    test('exists', () => {
      const registry = new ComponentRegistry()
      const world = new World()
      const component = new Component(world)
      const componentId = registry.getComponentId(component)

      const result = registry.getComponent(componentId)

      expect(result).toBe(component)
    })

    test('does not exist', () => {
      const registry = new ComponentRegistry()

      const result = registry.getComponent(0n)

      expect(result).toBe(undefined)
    })
  })

  test('_createId', () => {
    const registry = new ComponentRegistry()

    const result1 = registry._createId()
    const result2 = registry._createId()
    const result3 = registry._createId()

    expect(result1).toBe(1n)
    expect(result2).toBe(2n)
    expect(result3).toBe(4n)
  })
})
