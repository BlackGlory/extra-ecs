import { Structure, MapTypesOfStructureToPrimitives } from 'structure-of-arrays'
import { World } from './world'
export {
  int8
, int16
, int32
, uint8
, uint16
, uint32
, double
, float
, boolean
, string
} from 'structure-of-arrays'

export type ComponentId = bigint

export class Component<T extends Structure = any> {
  readonly id: ComponentId = this.world._componentRegistry.getComponentId(this)

  constructor(private world: World, public readonly structure?: T) {}

  getValue<U extends keyof T>(
    entityId: number
  , key: U
  ): MapTypesOfStructureToPrimitives<T>[U] | undefined {
    const archetype = this.world._entityArchetypeRegistry.getArchetype(entityId)!
    const storage = archetype.getStorage(this)
    if (storage) {
      return storage.get(entityId, key) as MapTypesOfStructureToPrimitives<T>[U] | undefined
    } else {
      return undefined
    }
  }

  setValue<U extends keyof T>(
    entityId: number
  , key: U
  , value: MapTypesOfStructureToPrimitives<T>[U]
  ): void {
    const archetype = this.world._entityArchetypeRegistry.getArchetype(entityId)
    if (archetype) {
      const storage = archetype.getStorage(this)
      if (storage) {
        storage.update(entityId, key, value as any)
      }
    }
  }
}
