import { StructureOfArrays, Structure } from 'structure-of-arrays'

export type Component<T extends Structure = any> =
| StructureOfArrays<T>
| symbol

export type ComponentId = number
