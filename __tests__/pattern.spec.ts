import { Component, int8 } from '@src/component'
import { World } from '@src/world'
import { Operator, allOf, and, anyOf, not, oneOf, or, xor } from '@src/pattern'

describe('Patterns', () => {
  test('not', () => {
    const world = new World()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })

    const result = not(component1, component2)

    expect(result).toStrictEqual([Operator.Not, component1, component2])
  })

  test('allOf', () => {
    const world = new World()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })

    const result = allOf(component1, component2)

    expect(result).toStrictEqual([Operator.AllOf, component1, component2])
  })

  test('anyOf', () => {
    const world = new World()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })

    const result = anyOf(component1, component2)

    expect(result).toStrictEqual([Operator.AnyOf, component1, component2])
  })

  test('oneOf', () => {
    const world = new World()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })

    const result = oneOf(component1, component2)

    expect(result).toStrictEqual([Operator.OneOf, component1, component2])
  })

  test('and', () => {
    const world = new World()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })

    const result = and(component1, component2)

    expect(result).toStrictEqual([Operator.AllOf, component1, component2])
  })

  test('or', () => {
    const world = new World()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })

    const result = or(component1, component2)

    expect(result).toStrictEqual([Operator.AnyOf, component1, component2])
  })

  test('xor', () => {
    const world = new World()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })

    const result = xor(component1, component2)

    expect(result).toStrictEqual([Operator.OneOf, component1, component2])
  })
})
