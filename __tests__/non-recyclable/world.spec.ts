import { describe, test, expect } from 'vitest'
import { toArray } from 'iterable-operator'
import { NonRecyclableWorld } from '@non-recyclable/world.js'

describe('NonRecyclableWorld', () => {
  describe('findAllEntityIds', () => {
    test('empty', () => {
      const world = new NonRecyclableWorld()

      const result = toArray(world.findAllEntityIds())

      expect(result).toStrictEqual([])
    })

    test('non-empty', () => {
      const world = new NonRecyclableWorld()
      const entityId = world.createEntityId()

      const result = toArray(world.findAllEntityIds())

      expect(result).toStrictEqual([entityId])
    })
  })

  describe('hasEntityId', () => {
    test('does not exist', () => {
      const world = new NonRecyclableWorld()

      const result = world.hasEntityId(0)

      expect(result).toBe(false)
    })

    test('exists', () => {
      const world = new NonRecyclableWorld()
      const entityId = world.createEntityId()

      const result = world.hasEntityId(entityId)

      expect(result).toBe(true)
    })
  })

  describe('createEntityId', () => {
    test('general', () => {
      const world = new NonRecyclableWorld()

      const entityId1 = world.createEntityId()
      const entityId2 = world.createEntityId()

      expect(entityId1).toBe(0)
      expect(entityId2).toBe(1)
    })

    test('non-recyclable', () => {
      const world = new NonRecyclableWorld()
      const entityId1 = world.createEntityId()
      const entityId2 = world.createEntityId()
      world.removeEntityId(entityId1)

      const entityId3 = world.createEntityId()

      expect(entityId1).toBe(0)
      expect(entityId2).toBe(1)
      expect(entityId3).toBe(2)
    })
  })

  describe('removeEntityId', () => {
    test('does not exist', () => {
      const world = new NonRecyclableWorld()

      world.removeEntityId(0)

      expect(world.hasEntityId(0)).toBe(false)
    })

    test('exists', () => {
      const world = new NonRecyclableWorld()
      const entityId = world.createEntityId()

      world.removeEntityId(entityId)

      expect(world.hasEntityId(entityId)).toBe(false)
    })
  })

  describe('findComponentIds', () => {
    test('entity does not exist', () => {
      const world = new NonRecyclableWorld()

      const result = toArray(world.findComponentIds(0))

      expect(result).toStrictEqual([])
    })

    describe('entity exists', () => {
      test('component does not exist', () => {
        const world = new NonRecyclableWorld()
        const entityId = world.createEntityId()

        const result = toArray(world.findComponentIds(entityId))

        expect(result).toStrictEqual([])
      })

      test('component exists', () => {
        const world = new NonRecyclableWorld()
        const entityId = world.createEntityId()
        const componentId = 0
        world.addComponentIds(entityId, [componentId])

        const result = toArray(world.findComponentIds(entityId))

        expect(result).toStrictEqual([componentId])
      })
    })
  })

  describe('addComponentIds', () => {
    test('entity does not exist', () => {
      const world = new NonRecyclableWorld()
      const componentId = 0
      const entityId = 0

      world.addComponentIds(entityId, [componentId])

      expect(world.hasEntityId(entityId)).toBe(false)
      expect(world.hasComponentId(entityId, componentId)).toBe(false)
    })

    describe('entity exists', () => {
      test('component does not exist', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()

        world.addComponentIds(entityId, [componentId])

        expect(world.hasComponentId(entityId, componentId)).toBe(true)
      })

      test('component exist', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        world.addComponentIds(entityId, [componentId])

        world.addComponentIds(entityId, [componentId])

        expect(world.hasComponentId(entityId, componentId)).toBe(true)
      })
    })
  })

  describe('removeComponentIds', () => {
    test('entity does not exist', () => {
      const world = new NonRecyclableWorld()
      const componentId = 0
      const entityId = 0

      world.removeComponentIds(entityId, [componentId])

      expect(world.hasEntityId(entityId)).toBe(false)
      expect(world.hasComponentId(entityId, componentId)).toBe(false)
    })

    describe('entity exists', () => {
      test('component does not exist', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()

        world.removeComponentIds(entityId, [componentId])

        expect(world.hasEntityId(entityId)).toBe(true)
        expect(world.hasComponentId(entityId, componentId)).toBe(false)
      })

      test('component exist', () => {
        const world = new NonRecyclableWorld()
        const componentId = 0
        const entityId = world.createEntityId()
        world.addComponentIds(entityId, [componentId])

        world.removeComponentIds(entityId, [componentId])

        expect(world.hasEntityId(entityId)).toBe(true)
        expect(world.hasComponentId(entityId, componentId)).toBe(false)
      })
    })
  })
})
