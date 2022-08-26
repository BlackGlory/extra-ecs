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
})
