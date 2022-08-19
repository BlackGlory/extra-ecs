import { Entity } from '@src/entity'
import { World } from '@src/world'
import { StructureOfArrays, int8 } from 'structure-of-arrays'
import { toArray } from 'iterable-operator'
import { isNumber } from '@blackglory/prelude'
import { getError } from 'return-style'
import '@blackglory/jest-matchers'

describe('Entity', () => {
  test('create', () => {
    const world = new World()
    const id = 0

    const result = new Entity(world, id)

    expect(result._id).toBe(id)
  })

  describe('exists', () => {
    test('exists', () => {
      const world = new World()
      const entity = new Entity(world)

      const result = entity.exists()

      expect(result).toBe(true)
    })

    test('does not exist', () => {
      const world = new World()
      const entity = new Entity(world, 100)

      const result = entity.exists()

      expect(result).toBe(false)
    })
  })

  test('remove', () => {
    const world = new World()
    const entity = new Entity(world)

    entity.remove()

    expect(entity.exists()).toBe(false)
  })

  describe('getAllComponents', () => {
    test('entity does not exist', () => {
      const world = new World()
      const entity = new Entity(world, 100)

      const err = getError(() => entity.getAllComponents())

      expect(err).toBeInstanceOf(Error)
    })

    describe('entity exists', () => {
      test('empty ', () => {
        const world = new World()
        const entity = new Entity(world)

        const result = entity.getAllComponents()
        const arr = toArray(result)

        expect(result).toBeIterable()
        expect(arr).toStrictEqual([])
      })

      test('non-empty', () => {
        const world = new World()
        const entity = new Entity(world)
        const component = new StructureOfArrays({ id: int8 })
        entity.addComponents([component, { id: 0 }])

        const result = entity.getAllComponents()
        const arr = toArray(result!)

        expect(result).toBeIterable()
        expect(arr).toStrictEqual([component])
      })
    })
  })

  describe('componentsExist', () => {
    test('component exists', () => {
      const world = new World()
      const entity = new Entity(world)
      const component = new StructureOfArrays({ id: int8 })
      entity.addComponents([component, { id: 0 }])

      const result = entity.componentsExist(component)

      expect(result).toStrictEqual([true])
    })

    test('component does not exist', () => {
      const world = new World()
      const entity = new Entity(world)
      const component = new StructureOfArrays({ id: int8 })

      const result = entity.componentsExist(component)

      expect(result).toStrictEqual([false])
    })
  })

  test('addComponents', () => {
    const world = new World()
    const entity = new Entity(world)
    const component = new StructureOfArrays({ id: int8 })

    entity.addComponents([component, { id: 0 }])

    expect(entity.componentsExist(component)[0]).toBe(true)
  })

  test('removeComponents', () => {
    const world = new World()
    const entity = new Entity(world)
    const component = new StructureOfArrays({ id: int8 })

    entity.removeComponents(component)

    expect(entity.componentsExist(component)[0]).toBe(false)
  })

  describe('getComponentIndexes', () => {
    test('exists', () => {
      const world = new World()
      const component = new StructureOfArrays({ id: int8 })
      const entity = new Entity(world)
      entity.addComponents([component, { id: 100 }])

      const [result] = entity.getComponentIndexes(component)

      expect(isNumber(result)).toBeTruthy()
      expect(component.arrays.id[result!]).toBe(100)
    })

    test('does not exist', () => {
      const world = new World()
      const component = new StructureOfArrays({ id: int8 })
      const entity = new Entity(world)

      const [result] = entity.getComponentIndexes(component)

      expect(result).toBe(undefined)
    })
  })
})
