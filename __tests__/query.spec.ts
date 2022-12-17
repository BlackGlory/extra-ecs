import { Query } from '@src/query'
import { not, and, or, xor, allOf, anyOf, oneOf } from '@src/pattern'
import { toArray } from 'iterable-operator'
import { World } from '@src/world'
import { getError } from 'return-style'

describe('Query', () => {
  test('findAllEntityIds', () => {
    const world = new World()
    const component1 = Symbol()
    const component2 = Symbol()
    const entityId1 = world.createEntityId()
    world.addComponents(entityId1, [component1])
    const entityId2 = world.createEntityId()
    world.addComponents(entityId2, [component2])
    const query = new Query(world, component1)

    const iter = query.findAllEntityIds()
    const result = toArray(iter)

    expect(result).toHaveLength(1)
    expect(result).toStrictEqual([entityId1])
  })

  describe('hasEntityId', () => {
    test('exists', () => {
      const world = new World()
      const component = Symbol()
      const entityId = world.createEntityId()
      world.addComponents(entityId, [component])
      const query = new Query(world, component)

      const result = query.hasEntityId(entityId)

      expect(result).toBe(true)
    })

    test('does not exist', () => {
      const world = new World()
      const component1 = Symbol()
      const component2 = Symbol()
      const entityId = world.createEntityId()
      world.addComponents(entityId, [component2])
      const query = new Query(world, component1)

      const result = query.hasEntityId(entityId)

      expect(result).toBe(false)
    })
  })

  describe('entityComponentsChanged event', () => {
    describe('remove entity', () => {
      test('entityId exists', () => {
        const world = new World()
        const component = Symbol()
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component])
        const query = new Query(world, component)
        world.removeEntityId(entityId)

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([])
      })

      test('entityId does not exist', () => {
        const world = new World()
        const component = Symbol()
        const entityId = world.createEntityId()
        const query = new Query(world, component)
        world.removeEntityId(entityId)

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([])
      })
    })

    describe('add entity components', () => {
      test('entityId exists', () => {
        const world = new World()
        const component = Symbol()
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component])
        const query = new Query(world, component)
        world.addComponents(entityId, [component])

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([entityId])
      })

      test('entityId does not exist', () => {
        const world = new World()
        const component = Symbol()
        const entityId = world.createEntityId()
        const query = new Query(world, component)
        world.addComponents(entityId, [component])

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([entityId])
      })
    })

    describe('remove entity components', () => {
      test('entityId exists', () => {
        const world = new World()
        const component = Symbol()
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component])
        const query = new Query(world, component)
        world.removeComponents(entityId, component)

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([])
      })

      test('entityId does not exist', () => {
        const world = new World()
        const component = Symbol()
        const entityId = world.createEntityId()
        const query = new Query(world, component)
        world.removeComponents(entityId, component)

        const result = toArray(query.findAllEntityIds())

        expect(result).toStrictEqual([])
      })
    })
  })

  test('destroy', () => {
    const world = new World()
    const component = Symbol()
    const query = new Query(world, component)

    query.destroy()
    const err1 = getError(() => query.findAllEntityIds())
    const err2 = getError(() => query.findAllEntityIds())

    expect(err1).toBeInstanceOf(Error)
    expect(err2).toBeInstanceOf(Error)
  })

  describe('matching', () => {
    test('not', () => {
      const world = new World()
      const component1 = Symbol()
      const component2 = Symbol()
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2])

      const query = new Query(world, not(component1))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([entityId2])
    })

    test('allOf', () => {
      const world = new World()
      const component1 = Symbol()
      const component2 = Symbol()
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1])
      world.addComponents(entityId3, [component2])

      const query = new Query(world, allOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([entityId3])
    })

    test('anyOf', () => {
      const world = new World()
      const component1 = Symbol()
      const component2 = Symbol()
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1])
      world.addComponents(entityId3, [component2])

      const query = new Query(world, anyOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(3)
      expect(arr).toStrictEqual([entityId1, entityId2, entityId3])
    })

    test('oneOf', () => {
      const world = new World()
      const component1 = Symbol()
      const component2 = Symbol()
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1])
      world.addComponents(entityId3, [component2])

      const query = new Query(world, oneOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(2)
      expect(arr).toStrictEqual([entityId1, entityId2])
    })

    test('and', () => {
      const world = new World()
      const component1 = Symbol()
      const component2 = Symbol()
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1])
      world.addComponents(entityId3, [component2])

      const query = new Query(world, and(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([entityId3])
    })

    test('or', () => {
      const world = new World()
      const component1 = Symbol()
      const component2 = Symbol()
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1])
      world.addComponents(entityId3, [component2])

      const query = new Query(world, or(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(3)
      expect(arr).toStrictEqual([entityId1, entityId2, entityId3])
    })

    test('xor', () => {
      const world = new World()
      const component1 = Symbol()
      const component2 = Symbol()
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1])
      world.addComponents(entityId3, [component2])

      const query = new Query(world, xor(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      expect(arr).toHaveLength(2)
      expect(arr).toStrictEqual([entityId1, entityId2])
    })
  })
})
