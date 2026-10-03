import { StructureOfArrays, StructureOfSparseMaps, Structure } from 'structure-of-arrays'

export type Component<T extends Structure = Structure> =
| StructureOfArrays<T>
| StructureOfSparseMaps<T>
| symbol
