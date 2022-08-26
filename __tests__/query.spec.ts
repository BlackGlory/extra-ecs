import { Query } from '@src/query'
import { not, and, or, xor, allOf, anyOf, oneOf } from '@src/pattern'
import { toArray } from 'iterable-operator'
import { World } from '@src/world'
import { Component, int8 } from '@src/component'
import { getError } from 'return-style'
import '@blackglory/jest-matchers'

describe('Query', () => {
  test('findAllEntityIds', () => {
    const world = new World()
    const component1 = new Component(world, { value: int8 })
    const component2 = new Component(world, { value: int8 })
    const entityId1 = world.createEntityId()
    world.addComponents(entityId1, [component1, { value: 0 }])
    const entityId2 = world.createEntityId()
    world.addComponents(entityId2, [component2, { value: 0 }])
    const query = new Query(world, component1)

    const result = query.findAllEntityIds()
    const arr = toArray(result)

    const archetype = world._archetypeRegistry.getArchtype(component1.id)
    expect(result).toBeIterable()
    expect(arr).toHaveLength(1)
    expect(arr).toStrictEqual([[archetype, entityId1]])
  })

  test('destroy', () => {
    const world = new World()
    const component = new Component(world, { value: int8 })
    const query = new Query(world, component)

    query.destroy()

    expect(getError(() => query.findAllEntityIds())).toBeInstanceOf(Error)
    expect(getError(() => query.findAllEntityIds())).toBeInstanceOf(Error)
  })

  describe('matching', () => {
    test('not', () => {
      const world = new World()
      const component1 = new Component(world, { value: int8 })
      const component2 = new Component(world, { value: int8 })
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1, { value: 0 }])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2, { value: 0 }])

      const query = new Query(world, not(component1))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      const archetype = world._archetypeRegistry.getArchtype(component2.id)
      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([[archetype, entityId2]])
    })

    test('allOf', () => {
      const world = new World()
      const component1 = new Component(world, { value: int8 })
      const component2 = new Component(world, { value: int8 })
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1, { value: 0 }])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2, { value: 0 }])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1, { value: 0 }])
      world.addComponents(entityId3, [component2, { value: 0 }])

      const query = new Query(world, allOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      const archetype = world._archetypeRegistry.getArchtype(
        component1.id + component2.id
      )
      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([[archetype, entityId3]])
    })

    test('anyOf', () => {
      const world = new World()
      const component1 = new Component(world, { value: int8 })
      const component2 = new Component(world, { value: int8 })
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1, { value: 0 }])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2, { value: 0 }])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1, { value: 0 }])
      world.addComponents(entityId3, [component2, { value: 0 }])

      const query = new Query(world, anyOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      const archetype1 = world._archetypeRegistry.getArchtype(component1.id)
      const archetype2 = world._archetypeRegistry.getArchtype(component2.id)
      const archetype3 = world._archetypeRegistry.getArchtype(
        component1.id + component2.id
      )
      expect(arr).toHaveLength(3)
      expect(arr).toStrictEqual([
        [archetype1, entityId1]
      , [archetype2, entityId2]
      , [archetype3, entityId3]
      ])
    })

    test('oneOf', () => {
      const world = new World()
      const component1 = new Component(world, { value: int8 })
      const component2 = new Component(world, { value: int8 })
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1, { value: 0 }])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2, { value: 0 }])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1, { value: 0 }])
      world.addComponents(entityId3, [component2, { value: 0 }])

      const query = new Query(world, oneOf(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      const archetype1 = world._archetypeRegistry.getArchtype(component1.id)
      const archetype2 = world._archetypeRegistry.getArchtype(component2.id)
      expect(arr).toHaveLength(2)
      expect(arr).toStrictEqual([
        [archetype1, entityId1]
      , [archetype2, entityId2]
      ])
    })

    test('and', () => {
      const world = new World()
      const component1 = new Component(world, { value: int8 })
      const component2 = new Component(world, { value: int8 })
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1, { value: 0 }])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2, { value: 0 }])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1, { value: 0 }])
      world.addComponents(entityId3, [component2, { value: 0 }])

      const query = new Query(world, and(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      const archetype = world._archetypeRegistry.getArchtype(
        component1.id + component2.id
      )
      expect(arr).toHaveLength(1)
      expect(arr).toStrictEqual([[archetype, entityId3]])
    })

    test('or', () => {
      const world = new World()
      const component1 = new Component(world, { value: int8 })
      const component2 = new Component(world, { value: int8 })
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1, { value: 0 }])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2, { value: 0 }])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1, { value: 0 }])
      world.addComponents(entityId3, [component2, { value: 0 }])

      const query = new Query(world, or(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      const archetype1 = world._archetypeRegistry.getArchtype(component1.id)
      const archetype2 = world._archetypeRegistry.getArchtype(component2.id)
      const archetype3 = world._archetypeRegistry.getArchtype(
        component1.id + component2.id
      )
      expect(arr).toHaveLength(3)
      expect(arr).toStrictEqual([
        [archetype1, entityId1]
      , [archetype2, entityId2]
      , [archetype3, entityId3]
      ])
    })

    test('xor', () => {
      const world = new World()
      const component1 = new Component(world, { value: int8 })
      const component2 = new Component(world, { value: int8 })
      const entityId1 = world.createEntityId()
      world.addComponents(entityId1, [component1, { value: 0 }])
      const entityId2 = world.createEntityId()
      world.addComponents(entityId2, [component2, { value: 0 }])
      const entityId3 = world.createEntityId()
      world.addComponents(entityId3, [component1, { value: 0 }])
      world.addComponents(entityId3, [component2, { value: 0 }])

      const query = new Query(world, xor(component1, component2))
      const result = query.findAllEntityIds()
      const arr = toArray(result)

      const archetype1 = world._archetypeRegistry.getArchtype(component1.id)
      const archetype2 = world._archetypeRegistry.getArchtype(component2.id)
      expect(arr).toHaveLength(2)
      expect(arr).toStrictEqual([
        [archetype1, entityId1]
      , [archetype2, entityId2]
      ])
    })
  })
})
