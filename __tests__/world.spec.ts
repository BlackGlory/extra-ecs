import { toArray } from 'iterable-operator'
import { World } from '@src/world'
import { StructureOfArrays, int8 } from 'structure-of-arrays'
import { getError } from 'return-style'
import '@blackglory/jest-matchers'

describe('World', () => {
  describe('getAllEntityIds', () => {
    test('empty', () => {
      const world = new World()

      const result = world.getAllEntityIds()
      const arr  = toArray(result)

      expect(result).toBeIterable()
      expect(arr).toStrictEqual([])
    })

    test('non-empty', () => {
      const world = new World()
      const entityId = world.createEntityId()

      const result = world.getAllEntityIds()
      const arr  = toArray(result)

      expect(result).toBeIterable()
      expect(arr).toStrictEqual([entityId])
    })
  })

  describe('hasEntityId', () => {
    test('does not exist', () => {
      const world = new World()

      const result = world.hasEntityId(0)

      expect(result).toBe(false)
    })

    test('exists', () => {
      const world = new World()
      const entityId = world.createEntityId()

      const result = world.hasEntityId(entityId)

      expect(result).toBe(true)
    })
  })

  describe('removeEntityId', () => {
    test('StructureOfArrays', () => {
      const world = new World()
      const component = new StructureOfArrays({ value: int8 })
      const entityId = world.createEntityId()
      world.addComponents(entityId, [component])

      world.removeEntityId(entityId)

      expect(world.hasEntityId(entityId)).toBe(false)
      expect(component.has(entityId)).toBe(false)
    })

    test('does not exist', () => {
      const world = new World()

      world.removeEntityId(0)

      expect(world.hasEntityId(0)).toBe(false)
    })

    test('exists', () => {
      const world = new World()
      const entityId = world.createEntityId()

      world.removeEntityId(entityId)

      expect(world.hasEntityId(entityId)).toBe(false)
    })
  })

  describe('componentsExist', () => {
    test('entity does not exist', () => {
      const world = new World()
      const component = Symbol()

      const err = getError(() => world.componentsExist(0, component))

      expect(err).toBeInstanceOf(Error)
    })

    describe('entity exists', () => {
      test('does not exist', () => {
        const world = new World()
        const component = Symbol()
        const entityId = world.createEntityId()

        const result = world.componentsExist(entityId, component)

        expect(result).toStrictEqual([false])
      })

      test('exist', () => {
        const world = new World()
        const component = Symbol()
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component])

        const result = world.componentsExist(entityId, component)

        expect(result).toStrictEqual([true])
      })
    })
  })

  describe('addComponents', () => {
    test('multiple components', () => {
      const world = new World()
      const component1 = new StructureOfArrays({ x: int8 })
      const component2 = new StructureOfArrays({ y: int8 })
      const component3 = Symbol()
      const entityId = world.createEntityId()

      world.addComponents(
        entityId
      , false
      , [component1, { x: 1 }]
      , [component2, { y: 2 }]
      , [component3]
      )

      expect(world.componentsExist(entityId, component1)[0]).toBe(true)
      expect(component1.arrays.x.length).toBe(1)
      expect(component1.arrays.x[entityId]).toBe(1)
      expect(world.componentsExist(entityId, component2)[0]).toBe(true)
      expect(component2.arrays.y.length).toBe(1)
      expect(component2.arrays.y[entityId]).toBe(2)
      expect(world.componentsExist(entityId, component3)[0]).toBe(true)
    })

    test('Falsy', () => {
      const world = new World()
      const entityId = world.createEntityId()

      world.addComponents(entityId, false)
    })

    test('with value', () => {
      const world = new World()
      const component = new StructureOfArrays({ value: int8 })
      const entityId = world.createEntityId()

      world.addComponents(entityId, [component, { value: 1 }])

      expect(world.componentsExist(entityId, component)[0]).toBe(true)
      expect(component.arrays.value.length).toBe(1)
      expect(component.arrays.value[entityId]).toBe(1)
    })

    test('without value', () => {
      const world = new World()
      const component = new StructureOfArrays({ value: int8 })
      const entityId = world.createEntityId()

      world.addComponents(entityId, [component])

      expect(world.componentsExist(entityId, component)[0]).toBe(true)
      expect(component.arrays.value.length).toBe(1)
      expect(component.arrays.value[entityId]).toBe(0)
    })
  })

  describe('removeComponents', () => {
    test('Falsy', () => {
      const world = new World()
      const component = Symbol()
      const entityId = world.createEntityId()
      world.addComponents(entityId, [component])

      world.removeComponents(entityId, false)

      expect(world.componentsExist(entityId, component)[0]).toBe(true)
    })

    test('does not exist', () => {
      const world = new World()
      const component = Symbol()
      const entityId = world.createEntityId()

      world.removeComponents(entityId, component)

      expect(world.componentsExist(entityId, component)[0]).toBe(false)
    })

    test('exists', () => {
      const world = new World()
      const component = Symbol()
      const entityId = world.createEntityId()
      world.addComponents(entityId, [component])

      world.removeComponents(entityId, component)

      expect(world.componentsExist(entityId, component)[0]).toBe(false)
    })
  })

  describe('getComponents', () => {
    test('entity does not exist', () => {
      const world = new World()

      const err = getError(() => world.getComponents(0))

      expect(err).toBeInstanceOf(Error)
    })

    describe('entity exists', () => {
      test('does not exist', () => {
        const world = new World()
        const entityId = world.createEntityId()

        const result = world.getComponents(entityId)
        const arr = toArray(result)

        expect(result).toBeIterable()
        expect(arr).toStrictEqual([])
      })

      test('exists', () => {
        const world = new World()
        const entityId = world.createEntityId()
        const component = Symbol()
        world.addComponents(entityId, [component])

        const result = world.getComponents(entityId)
        const arr = toArray(result)

        expect(result).toBeIterable()
        expect(arr).toStrictEqual([component])
      })
    })
  })
})
