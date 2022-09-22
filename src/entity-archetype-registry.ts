import { EntityId } from './entity-id'
import { Archetype } from './archetype'

export class EntityArchetypeRegistry {
  private entityIdToArchetype: Archetype[] = []

  setRelation(entityId: EntityId, archetype: Archetype): void {
    this.entityIdToArchetype[entityId] = archetype
  }

  removeRelation(entityId: EntityId): void {
    delete this.entityIdToArchetype[entityId]
  }

  getArchetype(entityId: EntityId): Archetype | undefined {
    return this.entityIdToArchetype[entityId]
  }
}
