import { describe, test, expect } from 'vitest'
import { not, and, or, xor, allOf, anyOf, oneOf } from '@src/pattern.js'
import { toArray } from 'iterable-operator'
import { RecyclableQuery } from '@recyclable/query.js'
import { RecyclableWorld } from '@recyclable/world.js'

describe('RecyclableQuery', () => {
  test('findAllEntityIds', () => {
    const world = new RecyclableWorld()
    const componentId1 = 0
    const componentId2 = 1
    const entityId1 = world.createEntityId()
    const entityId2 = world.createEntityId()
    const entityId3 = world.createEntityId()
    world.addComponentIds(entityId3, [componentId1])
    world.addComponentIds(entityId2, [componentId2])
    const query = new RecyclableQuery(world, componentId1)
    world.addComponentIds(entityId1, [componentId1])

    const result = toArray(query.findAllEntityIds())

    expect(result).toStrictEqual([entityId3, entityId1])
  })

  test('findAllEntityIdsAscending', () => {
    const world = new RecyclableWorld()
    const componentId1 = 0
    const componentId2 = 1
    const entityId1 = world.createEntityId()
    const entityId2 = world.createEntityId()
    const entityId3 = world.createEntityId()
    world.addComponentIds(entityId3, [componentId1])
    world.addComponentIds(entityId2, [componentId2])
    const query = new RecyclableQuery(world, componentId1)
    world.addComponentIds(entityId1, [componentId1])

    const result = toArray(query.findAllEntityIdsAscending())

    expect(result).toStrictEqual([entityId1, entityId3])
  })

  describe('hasEntityId', () => {
    test('exists', () => {
      const world = new RecyclableWorld()
      const componentId = 0
      const entityId = world.createEntityId()
      world.addComponentIds(entityId, [componentId])
      const query = new RecyclableQuery(world, componentId)

      const result = query.hasEntityId(entityId)

      expect(result).toBe(true)
    })

    test('does not exist', () => {
      const world = new RecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId = world.createEntityId()
      world.addComponentIds(entityId, [componentId2])
      const query = new RecyclableQuery(world, componentId1)

      const result = query.hasEntityId(entityId)

      expect(result).toBe(false)
    })
  })

  describe('handle world events', () => {
    describe('remove entity', () => {
      test('entityId exists', () => {
        const world = new RecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        world.addComponentIds(entityId, [componentId])
        const query = new RecyclableQuery(world, componentId)
        world.removeEntityId(entityId)

        const result1 = toArray(query.findAllEntityIds())
        const result2 = toArray(query.findAllEntityIdsAscending())

        expect(result1).toStrictEqual([])
        expect(result2).toStrictEqual([])
      })

      test('entityId does not exist', () => {
        const world = new RecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        const query = new RecyclableQuery(world, componentId)
        world.removeEntityId(entityId)

        const result1 = toArray(query.findAllEntityIds())
        const result2 = toArray(query.findAllEntityIdsAscending())

        expect(result1).toStrictEqual([])
        expect(result2).toStrictEqual([])
      })
    })

    describe('add entity components', () => {
      test('entityId exists', () => {
        const world = new RecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        world.addComponentIds(entityId, [componentId])
        const query = new RecyclableQuery(world, componentId)
        world.addComponentIds(entityId, [componentId])

        const result1 = toArray(query.findAllEntityIds())
        const result2 = toArray(query.findAllEntityIdsAscending())

        expect(result1).toStrictEqual([entityId])
        expect(result2).toStrictEqual([entityId])
      })

      test('entityId does not exist', () => {
        const world = new RecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        const query = new RecyclableQuery(world, componentId)
        world.addComponentIds(entityId, [componentId])

        const result1 = toArray(query.findAllEntityIds())
        const result2 = toArray(query.findAllEntityIdsAscending())

        expect(result1).toStrictEqual([entityId])
        expect(result2).toStrictEqual([entityId])
      })
    })

    describe('remove entity components', () => {
      test('entityId exists', () => {
        const world = new RecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        world.addComponentIds(entityId, [componentId])
        const query = new RecyclableQuery(world, componentId)
        world.removeComponentIds(entityId, [componentId])

        const result1 = toArray(query.findAllEntityIds())
        const result2 = toArray(query.findAllEntityIdsAscending())

        expect(result1).toStrictEqual([])
        expect(result2).toStrictEqual([])
      })

      test('entityId does not exist', () => {
        const world = new RecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        const query = new RecyclableQuery(world, componentId)
        world.removeComponentIds(entityId, [componentId])

        const result1 = toArray(query.findAllEntityIds())
        const result2 = toArray(query.findAllEntityIdsAscending())

        expect(result1).toStrictEqual([])
        expect(result2).toStrictEqual([])
      })
    })

    test('edge: Not only pattern', () => {
      const world = new RecyclableWorld()
      const componentId = 0
      const query = new RecyclableQuery(world, not(componentId))
      const entityId = world.createEntityId()

      const result1 = toArray(query.findAllEntityIds())
      const result2 = toArray(query.findAllEntityIdsAscending())

      expect(result1).toStrictEqual([entityId])
      expect(result2).toStrictEqual([entityId])
    })
  })

  test('destroy', () => {
    const world = new RecyclableWorld()
    const componentId = 0
    const query = new RecyclableQuery(world, componentId)
    query.destroy()
    const entityId = world.createEntityId()
    world.addComponentIds(entityId, [componentId])

    const result1 = toArray(query.findAllEntityIds())
    const result2 = toArray(query.findAllEntityIdsAscending())

    expect(result1).toStrictEqual([])
    expect(result2).toStrictEqual([])
  })

  describe('matching', () => {
    test('not', () => {
      const world = new RecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])

      const query = new RecyclableQuery(world, not(componentId1))
      const result1 = toArray(query.findAllEntityIds())
      const result2 = toArray(query.findAllEntityIdsAscending())

      expect(result1).toStrictEqual([entityId2])
      expect(result2).toStrictEqual([entityId2])
    })

    test('allOf', () => {
      const world = new RecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new RecyclableQuery(world, allOf(componentId1, componentId2))
      const result1 = toArray(query.findAllEntityIds())
      const result2 = toArray(query.findAllEntityIdsAscending())

      expect(result1).toStrictEqual([entityId3])
      expect(result2).toStrictEqual([entityId3])
    })

    test('anyOf', () => {
      const world = new RecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new RecyclableQuery(world, anyOf(componentId1, componentId2))
      const result1 = toArray(query.findAllEntityIds())
      const result2 = toArray(query.findAllEntityIdsAscending())

      expect(result1).toStrictEqual([entityId1, entityId2, entityId3])
      expect(result2).toStrictEqual([entityId1, entityId2, entityId3])
    })

    test('oneOf', () => {
      const world = new RecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new RecyclableQuery(world, oneOf(componentId1, componentId2))
      const result1 = toArray(query.findAllEntityIds())
      const result2 = toArray(query.findAllEntityIdsAscending())

      expect(result1).toStrictEqual([entityId1, entityId2])
      expect(result2).toStrictEqual([entityId1, entityId2])
    })

    test('and', () => {
      const world = new RecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new RecyclableQuery(world, and(componentId1, componentId2))
      const result1 = toArray(query.findAllEntityIds())
      const result2 = toArray(query.findAllEntityIdsAscending())

      expect(result1).toStrictEqual([entityId3])
      expect(result2).toStrictEqual([entityId3])
    })

    test('or', () => {
      const world = new RecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new RecyclableQuery(world, or(componentId1, componentId2))
      const result1 = toArray(query.findAllEntityIds())
      const result2 = toArray(query.findAllEntityIdsAscending())

      expect(result1).toStrictEqual([entityId1, entityId2, entityId3])
      expect(result2).toStrictEqual([entityId1, entityId2, entityId3])
    })

    test('xor', () => {
      const world = new RecyclableWorld()
      const componentId1 = 0
      const componentId2 = 1
      const entityId1 = world.createEntityId()
      world.addComponentIds(entityId1, [componentId1])
      const entityId2 = world.createEntityId()
      world.addComponentIds(entityId2, [componentId2])
      const entityId3 = world.createEntityId()
      world.addComponentIds(entityId3, [componentId1])
      world.addComponentIds(entityId3, [componentId2])

      const query = new RecyclableQuery(world, xor(componentId1, componentId2))
      const result1 = toArray(query.findAllEntityIds())
      const result2 = toArray(query.findAllEntityIdsAscending())

      expect(result1).toStrictEqual([entityId1, entityId2])
      expect(result2).toStrictEqual([entityId1, entityId2])
    })
  })
})
