import { describe, test, expect } from 'vitest'
import { not, and, or, xor, allOf, anyOf, oneOf } from '@src/pattern.js'
import { toArray } from 'iterable-operator'
import { NonRecyclableQuery } from '@non-recyclable/query.js'
import { NonRecyclableWorld } from '@non-recyclable/world.js'

describe('NonRecyclableQuery', () => {
  test('findAllEntityIds', () => {
    const world = new NonRecyclableWorld()
    const componentId1 = 0
    const componentId2 = 1
    const entityId1 = world.createEntityId()
    const entityId2 = world.createEntityId()
    const entityId3 = world.createEntityId()
    world.addComponentIds(entityId3, [componentId1])
    world.addComponentIds(entityId2, [componentId2])
    const query = new NonRecyclableQuery(world, componentId1)
    world.addComponentIds(entityId1, [componentId1])

    const result = toArray(query.findAllEntityIds())

    expect(result).toStrictEqual([entityId3, entityId1])
  })

  describe('hasEntityId', () => {
    test('exists', () => {
      const world = new NonRecyclableWorld()
      const componentId = 0
      const entityId = world.createEntityId()
      world.addComponentIds(entityId, [componentId])
      const query = new NonRecyclableQuery(world, componentId)

      const result = query.hasEntityId(entityId)

      expect(result).toBe(true)
    })

    test('does not exist', () => {
      const world = new NonRecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId = world.createEntityId()
      world.addComponentIds(entityId, [componentId2])
      const query = new NonRecyclableQuery(world, componentId1)

      const result = query.hasEntityId(entityId)

      expect(result).toBe(false)
    })
  })

  describe('handle world events', () => {
    describe('remove entity', () => {
      test('entityId exists', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        world.addComponentIds(entityId, [componentId])
        const query = new NonRecyclableQuery(world, componentId)
        world.removeEntityId(entityId)

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([])
      })

      test('entityId does not exist', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        const query = new NonRecyclableQuery(world, componentId)
        world.removeEntityId(entityId)

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([])
      })
    })

    describe('add entity components', () => {
      test('entityId exists', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        world.addComponentIds(entityId, [componentId])
        const query = new NonRecyclableQuery(world, componentId)
        world.addComponentIds(entityId, [componentId])

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([entityId])
      })

      test('entityId does not exist', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        const query = new NonRecyclableQuery(world, componentId)
        world.addComponentIds(entityId, [componentId])

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([entityId])
      })
    })

    describe('remove entity components', () => {
      test('entityId exists', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        world.addComponentIds(entityId, [componentId])
        const query = new NonRecyclableQuery(world, componentId)
        world.removeComponentIds(entityId, [componentId])

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([])
      })

      test('entityId does not exist', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        const query = new NonRecyclableQuery(world, componentId)
        world.removeComponentIds(entityId, [componentId])

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([])
      })
    })
  })

  test('destroy', () => {
    const world = new NonRecyclableWorld()
    const componentId = 0
    const query = new NonRecyclableQuery(world, componentId)
    query.destroy()
    const entityId = world.createEntityId()
    world.addComponentIds(entityId, [componentId])

    const result = toArray(query.findAllEntityIds())

    expect(result).toStrictEqual([])
  })

  describe('matching', () => {
    test('not', () => {
      const world = new NonRecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])

      const query = new NonRecyclableQuery(world, not(componentId1))
      const result = toArray(query.findAllEntityIds())

      expect(result).toStrictEqual([entityId2])
    })

    test('allOf', () => {
      const world = new NonRecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new NonRecyclableQuery(world, allOf(componentId1, componentId2))
      const result = toArray(query.findAllEntityIds())

      expect(result).toStrictEqual([entityId3])
    })

    test('anyOf', () => {
      const world = new NonRecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new NonRecyclableQuery(world, anyOf(componentId1, componentId2))
      const result = toArray(query.findAllEntityIds())

      expect(result).toStrictEqual([entityId1, entityId2, entityId3])
    })

    test('oneOf', () => {
      const world = new NonRecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new NonRecyclableQuery(world, oneOf(componentId1, componentId2))
      const result = toArray(query.findAllEntityIds())

      expect(result).toStrictEqual([entityId1, entityId2])
    })

    test('and', () => {
      const world = new NonRecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new NonRecyclableQuery(world, and(componentId1, componentId2))
      const result = toArray(query.findAllEntityIds())

      expect(result).toStrictEqual([entityId3])
    })

    test('or', () => {
      const world = new NonRecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new NonRecyclableQuery(world, or(componentId1, componentId2))
      const result = toArray(query.findAllEntityIds())

      expect(result).toStrictEqual([entityId1, entityId2, entityId3])
    })

    test('xor', () => {
      const world = new NonRecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new NonRecyclableQuery(world, xor(componentId1, componentId2))
      const result = toArray(query.findAllEntityIds())

      expect(result).toStrictEqual([entityId1, entityId2])
    })
  })
})
