import { Archetype, ArchetypeId } from './archetype'

export class ArchetypeRegistry {
  private archetypeIdToArchetype: Map<ArchetypeId, Archetype> = new Map()

  getAllArchtypes(): Iterable<Archetype> {
    return this.archetypeIdToArchetype.values()
  }

  getArchtype(id: ArchetypeId): Archetype | undefined {
    return this.archetypeIdToArchetype.get(id)
  }

  addArchetype(archetype: Archetype): void {
    this.archetypeIdToArchetype.set(archetype.id, archetype)
  }

  hasArchetype(id: ArchetypeId): boolean {
    return this.archetypeIdToArchetype.has(id)
  }
}
