import { toArray } from 'iterable-operator'
import { ArchetypeRegistry } from '@src/archetype-registry'
import { Archetype, EmptyArchetypeId } from '@src/archetype'
import { World } from '@src/world'
import { Component } from '@src/component'
import '@blackglory/jest-matchers'

describe('ArchtypeRegistry', () => {
  test('addArchetype', () => {
    const registry = new ArchetypeRegistry()
    const world = new World()
    const archetype = new Archetype(world, new Set())

    registry.addArchetype(archetype)

    expect(registry.hasArchetype(archetype.id)).toBe(true)
  })

  describe('hasArchtype', () => {
    test('exists', () => {
      const registry = new ArchetypeRegistry()
      const world = new World()
      const archetype = new Archetype(world, new Set())
      registry.addArchetype(archetype)

      const result = registry.hasArchetype(archetype.id)

      expect(result).toBe(true)
    })

    test('does not exist', () => {
      const registry = new ArchetypeRegistry()
      const world = new World()
      const archetype = new Archetype(world, new Set())

      const result = registry.hasArchetype(archetype.id)

      expect(result).toBe(false)
    })
  })

  describe('getArchtype', () => {
    test('exists', () => {
      const registry = new ArchetypeRegistry()
      const world = new World()
      const archetype = new Archetype(world, new Set())
      registry.addArchetype(archetype)

      const result = registry.getArchetypee(archetype.id)

      expect(result).toBe(archetype)
    })

    test('does not exist', () => {
      const registry = new ArchetypeRegistry()

      const result = registry.getArchetypee(EmptyArchetypeId)

      expect(result).toBe(undefined)
    })
  })

  describe('getAllArchtypes', () => {
    test('empty', () => {
      const registry = new ArchetypeRegistry()

      const result = registry.getAllArchetypes()
      const arrResult = toArray(result)

      expect(result).toBeIterable()
      expect(arrResult).toStrictEqual([])
    })

    test('non-empty', () => {
      const registry = new ArchetypeRegistry()
      const world = new World()
      const component = new Component(world)
      const archetype1 = new Archetype(world, new Set())
      const archetype2 = new Archetype(world, new Set([component]))
      registry.addArchetype(archetype1)
      registry.addArchetype(archetype2)

      const result = registry.getAllArchetypes()
      const arrResult = toArray(result)

      expect(result).toBeIterable()
      expect(arrResult).toStrictEqual([archetype1, archetype2])
    })
  })
})
