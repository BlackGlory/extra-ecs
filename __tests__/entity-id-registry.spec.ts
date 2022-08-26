import { EntityIdRegistry } from '@src/entity-id-registry'
import { toArray } from 'iterable-operator'
import '@blackglory/jest-matchers'

describe('EntityIdRegistry', () => {
  test('createEntityId', () => {
    const registry = new EntityIdRegistry()

    const result1 = registry.createEntityId()
    const result2 = registry.createEntityId()

    expect(result1).toBe(0)
    expect(result2).toBe(1)
  })

  describe('hasEntityId', () => {
    test('exists', () => {
      const registry = new EntityIdRegistry()
      const entityId = registry.createEntityId()

      const result = registry.hasEntityId(entityId)

      expect(result).toBe(true)
    })

    test('does not exist', () => {
      const registry = new EntityIdRegistry()

      const result = registry.hasEntityId(0)

      expect(result).toBe(false)
    })
  })

  describe('removeEntityId', () => {
    test('exists', () => {
      const registry = new EntityIdRegistry()
      const entityId = registry.createEntityId()

      registry.removeEntityId(entityId)

      expect(registry.hasEntityId(entityId)).toBe(false)
    })

    test('does not exist', () => {
      const registry = new EntityIdRegistry()

      registry.removeEntityId(0)

      expect(registry.hasEntityId(0)).toBe(false)
    })
  })

  describe('getAllEntityIds', () => {
    test('empty', () => {
      const registry = new EntityIdRegistry()

      const result = registry.getAllEntityIds()
      const arrResult = toArray(result)

      expect(result).toBeIterable()
      expect(arrResult).toStrictEqual([])
    })

    test('non-empty', () => {
      const registry = new EntityIdRegistry()
      const entityId1 = registry.createEntityId()
      const entityId2 = registry.createEntityId()

      const result = registry.getAllEntityIds()
      const arrResult = toArray(result)

      expect(result).toBeIterable()
      expect(arrResult).toStrictEqual([entityId1, entityId2])
    })
  })
})
