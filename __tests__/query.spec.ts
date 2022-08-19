import { StructureOfArrays, int8 } from 'structure-of-arrays'
import { Query } from '@src/query'
import { not, and, or, xor, allOf, anyOf, oneOf } from '@src/pattern'
import { toArray } from 'iterable-operator'
import { World } from '@src/world'
import { Entity } from '@src/entity'
import { getError } from 'return-style'
import '@blackglory/jest-matchers'

describe('Query', () => {
  test('create', () => {
    const world = new World()
    const component = new StructureOfArrays({ id: int8 })

    new Query(world, component)
  })

  test('findAllEntities', () => {
    const world = new World()
    const component1 = new StructureOfArrays({ id: int8 })
    const component2 = new StructureOfArrays({ id: int8 })
    const entity1 = new Entity(world)
    entity1.addComponents([component1, { id: 0 }])
    const entity2 = new Entity(world)
    entity2.addComponents([component2, { id: 0 }])
    const query = new Query(world, component1)

    const result = query.findAllEntities()
    const arr = toArray(result)

    expect(result).toBeIterable()
    expect(arr).toHaveLength(1)
    expect(arr[0].id).toBe(entity1.id)
  })

  test('findAllEntityIds', () => {
    const world = new World()
    const component1 = new StructureOfArrays({ id: int8 })
    const component2 = new StructureOfArrays({ id: int8 })
    const entity1 = new Entity(world)
    entity1.addComponents([component1, { id: 0 }])
    const entity2 = new Entity(world)
    entity2.addComponents([component2, { id: 0 }])
    const query = new Query(world, component1)

    const result = query.findAllEntityIds()
    const arr = toArray(result)

    expect(result).toBeIterable()
    expect(arr).toHaveLength(1)
    expect(arr).toStrictEqual([entity1.id])
  })

  test('destroy', () => {
    const world = new World()
    const component = new StructureOfArrays({ id: int8 })
    const query = new Query(world, component)

    query.destroy()
    const err1 = getError(() => query.findAllEntities())
    const err2 = getError(() => query.findAllEntities())

    expect(err1).toBeInstanceOf(Error)
    expect(err2).toBeInstanceOf(Error)
  })

  describe('matching', () => {
    test('not', () => {
      const world = new World()
      const component1 = new StructureOfArrays({ id: int8 })
      const component2 = new StructureOfArrays({ id: int8 })
      const entity1 = new Entity(world)
      entity1.addComponents([component1, { id: 0 }])
      const entity2 = new Entity(world)
      entity2.addComponents([component2, { id: 0 }])

      const query = new Query(world, not(component1))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([entity2.id])
    })

    test('allOf', () => {
      const world = new World()
      const component1 = new StructureOfArrays({ id: int8 })
      const component2 = new StructureOfArrays({ id: int8 })
      const entity1 = new Entity(world)
      entity1.addComponents([component1, { id: 0 }])
      const entity2 = new Entity(world)
      entity2.addComponents([component2, { id: 0 }])
      const entity3 = new Entity(world)
      entity3.addComponents([component1, { id: 0 }])
      entity3.addComponents([component2, { id: 0 }])

      const query = new Query(world, allOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([entity3.id])
    })

    test('anyOf', () => {
      const world = new World()
      const component1 = new StructureOfArrays({ id: int8 })
      const component2 = new StructureOfArrays({ id: int8 })
      const entity1 = new Entity(world)
      entity1.addComponents([component1, { id: 0 }])
      const entity2 = new Entity(world)
      entity2.addComponents([component2, { id: 0 }])
      const entity3 = new Entity(world)
      entity3.addComponents([component1, { id: 0 }])
      entity3.addComponents([component2, { id: 0 }])

      const query = new Query(world, anyOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(3)
      expect(arr).toStrictEqual([entity1.id, entity2.id, entity3.id])
    })

    test('oneOf', () => {
      const world = new World()
      const component1 = new StructureOfArrays({ id: int8 })
      const component2 = new StructureOfArrays({ id: int8 })
      const entity1 = new Entity(world)
      entity1.addComponents([component1, { id: 0 }])
      const entity2 = new Entity(world)
      entity2.addComponents([component2, { id: 0 }])
      const entity3 = new Entity(world)
      entity3.addComponents([component1, { id: 0 }])
      entity3.addComponents([component2, { id: 0 }])

      const query = new Query(world, oneOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(2)
      expect(arr).toStrictEqual([entity1.id, entity2.id])
    })

    test('and', () => {
      const world = new World()
      const component1 = new StructureOfArrays({ id: int8 })
      const component2 = new StructureOfArrays({ id: int8 })
      const entity1 = new Entity(world)
      entity1.addComponents([component1, { id: 0 }])
      const entity2 = new Entity(world)
      entity2.addComponents([component2, { id: 0 }])
      const entity3 = new Entity(world)
      entity3.addComponents([component1, { id: 0 }])
      entity3.addComponents([component2, { id: 0 }])

      const query = new Query(world, and(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([entity3.id])
    })

    test('or', () => {
      const world = new World()
      const component1 = new StructureOfArrays({ id: int8 })
      const component2 = new StructureOfArrays({ id: int8 })
      const entity1 = new Entity(world)
      entity1.addComponents([component1, { id: 0 }])
      const entity2 = new Entity(world)
      entity2.addComponents([component2, { id: 0 }])
      const entity3 = new Entity(world)
      entity3.addComponents([component1, { id: 0 }])
      entity3.addComponents([component2, { id: 0 }])

      const query = new Query(world, or(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(3)
      expect(arr).toStrictEqual([entity1.id, entity2.id, entity3.id])
    })

    test('xor', () => {
      const world = new World()
      const component1 = new StructureOfArrays({ id: int8 })
      const component2 = new StructureOfArrays({ id: int8 })
      const entity1 = new Entity(world)
      entity1.addComponents([component1, { id: 0 }])
      const entity2 = new Entity(world)
      entity2.addComponents([component2, { id: 0 }])
      const entity3 = new Entity(world)
      entity3.addComponents([component1, { id: 0 }])
      entity3.addComponents([component2, { id: 0 }])

      const query = new Query(world, xor(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(2)
      expect(arr).toStrictEqual([entity1.id, entity2.id])
    })
  })
})
