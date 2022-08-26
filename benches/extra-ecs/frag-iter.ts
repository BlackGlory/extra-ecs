import { World, Query } from '../..'
import { StructureOfArrays, int32 } from 'structure-of-arrays'

const COMPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function fragIter(count: number): () => void {
  const world = new World()

  const components = COMPS.map(
    () => new StructureOfArrays({ value: int32 })
  )

  const Z = components[25]
  const Data = new StructureOfArrays({ value: int32 })

  const queryData = new Query(world, Data)
  const queryZ = new Query(world, Z)

  for (let i = count; i--;) {
    for (const component of components) {
      const entityId = world.createEntityId()
      world.addComponents(entityId, [Data], [component])
    }
  }

  return () => {
    dataSystem()
    zSystem()
  }

  function dataSystem(): void {
    for (const entityId of queryData.findAllEntityIds()) {
      Data.arrays.value[entityId] *= 2
    }
  }

  function zSystem(): void {
    for (const entityId of queryZ.findAllEntityIds()) {
      Z.arrays.value[entityId] *= 2
    }
  }
}
