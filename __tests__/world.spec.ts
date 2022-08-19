import { toArray } from 'iterable-operator'
import { World } from '@src/world'
import { StructureOfArrays, int8 } from 'structure-of-arrays'
import { getError } from 'return-style'
import '@blackglory/jest-matchers'

describe('World', () => {
  test('create', () => {
    new World()
  })

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
      const component = new StructureOfArrays({ id: int8 })

      const err = getError(() => world.componentsExist(0, component))

      expect(err).toBeInstanceOf(Error)
    })

    describe('entity exists', () => {
      test('does not exist', () => {
        const world = new World()
        const component = new StructureOfArrays({ id: int8 })
        const entityId = world.createEntityId()

        const result = world.componentsExist(entityId, component)

        expect(result).toStrictEqual([false])
      })

      test('exist', () => {
        const world = new World()
        const component = new StructureOfArrays({ id: int8 })
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component, { id: 0 }])

        const result = world.componentsExist(entityId, component)

        expect(result).toStrictEqual([true])
      })
    })
  })

  test('addComponents', () => {
    const world = new World()
    const component = new StructureOfArrays({ id: int8 })
    const entityId = world.createEntityId()

    world.addComponents(entityId, [component, { id: 1 }])

    expect(world.componentsExist(entityId, component)[0]).toStrictEqual(true)
    const [index] = world.getComponentIndexes(entityId, component)
    expect(index).not.toBe(undefined)
    expect(component.arrays.id.length).toBe(1)
    expect(component.arrays.id[index!]).toBe(1)
  })

  describe('removeComponents', () => {
    test('does not exist', () => {
      const world = new World()
      const component = new StructureOfArrays({ id: int8 })
      const entityId = world.createEntityId()

      world.removeComponents(entityId, component)

      expect(world.componentsExist(entityId, component)[0]).toStrictEqual(false)
      const [index] = world.getComponentIndexes(entityId, component)
      expect(index).toBe(undefined)
    })

    test('exists', () => {
      const world = new World()
      const component = new StructureOfArrays({ id: int8 })
      const entityId = world.createEntityId()
      world.addComponents(entityId, [component, { id: 1 }])

      world.removeComponents(entityId, component)

      expect(world.componentsExist(entityId, component)[0]).toStrictEqual(false)
      const [index] = world.getComponentIndexes(entityId, component)
      expect(index).toBe(undefined)
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
        const component = new StructureOfArrays({ id: int8 })
        world.addComponents(entityId, [component, { id: 0 }])

        const result = world.getComponents(entityId)
        const arr = toArray(result)

        expect(result).toBeIterable()
        expect(arr).toStrictEqual([component])
      })
    })
  })

  describe('getComponentIndexes', () => {
    test('entity does not exist', () => {
      const world = new World()
      const component = new StructureOfArrays({ id: int8 })

      const err = getError(() => world.getComponentIndexes(0, component))

      expect(err).toBeInstanceOf(Error)
    })

    describe('eneity exists', () => {
      test('does not exist', () => {
        const world = new World()
        const component = new StructureOfArrays({ id: int8 })
        const entityId = world.createEntityId()

        const result = world.getComponentIndexes(entityId, component)

        expect(result).toEqual([undefined])
      })

      test('exists', () => {
        const world = new World()
        const component = new StructureOfArrays({ id: int8 })
        const entityId = world.createEntityId()
        world.addComponents(entityId, [component, { id: 1 }])

        const result = world.getComponentIndexes(entityId, component)

        expect(result).toStrictEqual([expect.any(Number)])
        expect(component.arrays.id[result[0]!]).toBe(1)
      })
    })
  })
})
