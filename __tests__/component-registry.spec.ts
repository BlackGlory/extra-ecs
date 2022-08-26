import { ComponentRegistry } from '@src/component-registry'

describe('ComponentRegistry', () => {
  test('getComponentId', () => {
    const component = Symbol()
    const registry = new ComponentRegistry()

    const result1 = registry.getComponentId(component)
    const result2 = registry.getComponentId(component)

    expect(result1).toBe(0)
    expect(result2).toBe(result1)
  })

  describe('getComponent', () => {
    test('exists', () => {
      const component = Symbol()
      const registry = new ComponentRegistry()
      const componentId = registry.getComponentId(component)

      const result = registry.getComponent(componentId)

      expect(result).toBe(component)
    })

    test('does not exist', () => {
      const component = Symbol()
      const registry = new ComponentRegistry()
      const componentId = 0

      const result = registry.getComponent(componentId)

      expect(result).toBe(undefined)
    })
  })

  test('_createId', () => {
    const registry = new ComponentRegistry()

    const result1 = registry._createId()
    const result2 = registry._createId()

    expect(result1).toBe(0)
    expect(result2).toBe(1)
  })
})
