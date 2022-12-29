import { StructureOfArrays, StructureOfSparseMaps, Structure } from 'structure-of-arrays'

export type Component<T extends Structure = any> =
| StructureOfArrays<T>
| StructureOfSparseMaps<T>
| symbol
