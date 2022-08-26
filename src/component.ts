import { go } from '@blackglory/go'
import { Structure, MapTypesOfStructureToInternalArrays } from 'structure-of-arrays'
import { isntUndefined } from '@blackglory/prelude'
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
  readonly arrays: MapTypesOfStructureToInternalArrays<T>
  readonly id: ComponentId

  constructor(
    world: World
  , public readonly structure?: T
  ) {
    this.arrays = go(() => {
      // 通过原型在V8优化defineProperty
      // https://stackoverflow.com/questions/36338289/object-descriptor-getter-setter-performance-in-recent-chrome-v8-versions
      const internalArrays: Record<string, unknown> = {}

      if (structure) {
        Object.keys(structure).forEach(key => {
          const proxy = new Proxy(Object.create([]), {
            set: (_, property: string, value: number | string | boolean): boolean => {
              const entityId = Number.parseInt(property, 10)
              const archetype = world._entityArchetypeRegistry.getArchetype(entityId)!
              const storage = archetype.getStorage(this)!
              const index = storage.getInternalIndex(entityId)
              storage.arrays[key][index] = value
              return true
            }
          , get: (_, property: string): number | string | boolean | undefined => {
              const entityId = Number.parseInt(property, 10)
              const archetype = world._entityArchetypeRegistry.getArchetype(entityId)!
              const storage = archetype.getStorage(this)!
              const index = storage.tryGetInternalIndex(entityId)
              if (isntUndefined(index)) {
                return storage.arrays[key][index]
              } else {
                return undefined
              }
            }
          })

          internalArrays[key] = proxy
        })
      }

      return Object.create(internalArrays) as MapTypesOfStructureToInternalArrays<T>
    })

    this.id = world._componentRegistry.getComponentId(this)
  }
}
