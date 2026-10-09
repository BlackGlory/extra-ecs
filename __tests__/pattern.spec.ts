import { test, expect } from 'vitest'
import { Operator, allOf, and, anyOf, not, oneOf, or, xor, extractComponentIds } from '@src/pattern.js'
import { toArray } from 'iterable-operator'

test('not', () => {
  const componentId1 = 0
  const componentId2 = 1

  const result = not(componentId1, componentId2)

  expect(result).toStrictEqual({
    type: Operator.Not
  , children: [componentId1, componentId2]
  })
})

test('allOf', () => {
  const componentId1 = 0
  const componentId2 = 1

  const result = allOf(componentId1, componentId2)

  expect(result).toStrictEqual({
    type: Operator.AllOf
  , children: [componentId1, componentId2]
  })
})

test('anyOf', () => {
  const componentId1 = 0
  const componentId2 = 1

  const result = anyOf(componentId1, componentId2)

  expect(result).toStrictEqual({
    type: Operator.AnyOf
  , children: [componentId1, componentId2]
  })
})

test('oneOf', () => {
  const componentId1 = 0
  const componentId2 = 1

  const result = oneOf(componentId1, componentId2)

  expect(result).toStrictEqual({
    type: Operator.OneOf
  , children: [componentId1, componentId2]
  })
})

test('and', () => {
  const componentId1 = 0
  const componentId2 = 1

  const result = and(componentId1, componentId2)

  expect(result).toStrictEqual({
    type: Operator.AllOf
  , children: [componentId1, componentId2]
  })
})

test('or', () => {
  const componentId1 = 0
  const componentId2 = 1

  const result = or(componentId1, componentId2)

  expect(result).toStrictEqual({
    type: Operator.AnyOf
  , children: [componentId1, componentId2]
  })
})

test('xor', () => {
  const componentId1 = 0
  const componentId2 = 1

  const result = xor(componentId1, componentId2)

  expect(result).toStrictEqual({
    type: Operator.OneOf
  , children: [componentId1, componentId2]
  })
})

test('extractComponentIds', () => {
  const componentId1 = 0
  const componentId2 = 1
  const componentId3 = 2
  const pattern = anyOf(
    componentId1
  , allOf(componentId2, componentId3)
  )

  const result = toArray(extractComponentIds(pattern))

  expect(result).toStrictEqual([componentId1, componentId2, componentId3])
})
