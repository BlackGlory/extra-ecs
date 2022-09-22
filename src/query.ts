import { toArray, some, filter, every, drop, count } from 'iterable-operator'
import { assert } from '@blackglory/prelude'
import { World } from './world'
import { EntityId } from './entity-id'
import { Pattern, isExpression, isAllOf, isAnyOf, isNot, isOneOf } from './pattern'
import { Component } from './component'
import { Archetype } from './archetype'

export class Query {
  private isAvailable: boolean = true
  private relatedArchetypeSet: Set<Archetype> = new Set()
  private removeNewArchetypeAddedListener: () => void

  constructor(world: World, pattern: Pattern) {
    for (const archetype of world._archetypeRegistry.getAllArchetypes()) {
      if (isArchetypeMatch(archetype, pattern)) {
        this.relatedArchetypeSet.add(archetype)
      }
    }

    this.removeNewArchetypeAddedListener = world.on(
      'newArchetypeAdded'
    , (archetype: Archetype): void => {
        if (isArchetypeMatch(archetype, pattern)) {
          this.relatedArchetypeSet.add(archetype)
        }
      }
    )
  }

  destroy(): void {
    this.isAvailable = false
    this.removeNewArchetypeAddedListener()
  }

  findAllEntityIds(): Iterable<EntityId> {
    assert(this.isAvailable, 'The query is not available')

    return this._findAllEntityIds()
  }

  private * _findAllEntityIds(): Iterable<EntityId> {
    for (const archetype of this.relatedArchetypeSet) {
      yield* archetype.getEntityIdsForStorageTraversal()
    }
  }
}

function isArchetypeMatch(archetype: Archetype, pattern: Pattern): boolean {
  const components = toArray(archetype.getAllComponents())
  return isComponentsMatch(components, pattern)
}

function isComponentsMatch(components: Component[], pattern: Pattern): boolean {
  if (isExpression(pattern)) {
    if (isNot(pattern)) {
      return !some(
        drop(pattern, 1) as Iterable<Pattern>
      , pattern => isComponentsMatch(components, pattern)
      )
    } else if (isAllOf(pattern)) {
      return every(
        drop(pattern, 1) as Iterable<Pattern>
      , pattern => isComponentsMatch(components, pattern)
      )
    } else if (isAnyOf(pattern)) {
      return some(
        drop(pattern, 1) as Iterable<Pattern>
      , pattern => isComponentsMatch(components, pattern)
      )
    } else if (isOneOf(pattern)) {
      return count(filter(
        drop(pattern, 1) as Iterable<Pattern>
      , pattern => isComponentsMatch(components, pattern)
      )) === 1
    } else {
      throw new Error('Invalid pattern')
    }
  } else {
    return some(components, component => component === pattern)
  }
}
