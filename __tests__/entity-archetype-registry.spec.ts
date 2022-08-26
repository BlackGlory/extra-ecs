import { EntityArchetypeRegistry } from '@src/entity-archetype-registry'
import { World } from '@src/world'
import { Archetype } from '@src/archetype'

describe('EntityArchetypeRegistry', () => {
  describe('setRelation', () => {
    test('exists', () => {
      const registry = new EntityArchetypeRegistry()
      const world = new World()
      const archetype1 = new Archetype(world, new Set())
      const archetype2 = new Archetype(world, new Set())
      registry.setRelation(0, archetype1)

      registry.setRelation(0, archetype2)

      expect(registry.getArchetype(0)).toBe(archetype2)
    })

    test('does not exist', () => {
      const registry = new EntityArchetypeRegistry()
      const world = new World()
      const archetype = new Archetype(world, new Set())

      registry.setRelation(0, archetype)

      expect(registry.getArchetype(0)).toBe(archetype)
    })
  })

  describe('removeRelation', () => {
    test('exists', () => {
      const registry = new EntityArchetypeRegistry()
      const world = new World()
      const archetype = new Archetype(world, new Set())

      registry.removeRelation(0)

      expect(registry.getArchetype(0)).toBe(undefined)
    })

    test('does not exist', () => {
      const registry = new EntityArchetypeRegistry()
      const world = new World()
      const archetype = new Archetype(world, new Set())
      registry.setRelation(0, archetype)

      registry.removeRelation(0)

      expect(registry.getArchetype(0)).toBe(undefined)
    })
  })

  describe('getArchetype', () => {
    test('exists', () => {
      const registry = new EntityArchetypeRegistry()
      const world = new World()
      const archetype = new Archetype(world, new Set())
      registry.setRelation(0, archetype)

      const result = registry.getArchetype(0)

      expect(result).toBe(archetype)
    })

    test('does not exist', () => {
      const registry = new EntityArchetypeRegistry()

      const result = registry.getArchetype(0)

      expect(result).toBe(undefined)
    })
  })
})
