import { EntityId } from './entity-id'
import { Archetype } from './archetype'

export class EntityArchetypeRegistry {
  private entityIdToArchetype: Map<EntityId, Archetype> = new Map()

  setRelation(entityId: EntityId, archetype: Archetype): void {
    this.entityIdToArchetype.set(entityId, archetype)
  }

  removeRelation(entityId: EntityId): void {
    this.entityIdToArchetype.delete(entityId)
  }

  getArchetype(entityId: EntityId): Archetype | undefined {
    return this.entityIdToArchetype.get(entityId)
  }
}
