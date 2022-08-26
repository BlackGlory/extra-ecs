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
  readonly id: ComponentId

  constructor(
    private world: World
  , public readonly structure?: T
  ) {
    this.id = this.world._componentRegistry.getComponentId(this)
  }
}
