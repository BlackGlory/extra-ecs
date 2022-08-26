import { World, Query } from '../..'
import { StructureOfArrays, int32 } from 'structure-of-arrays'

export function packed5(count: number): () => void {
  const world = new World()

  const A = new StructureOfArrays({ value: int32 })
  const B = new StructureOfArrays({ value: int32 })
  const C = new StructureOfArrays({ value: int32 })
  const D = new StructureOfArrays({ value: int32 })
  const E = new StructureOfArrays({ value: int32 })

  const queryA = new Query(world, A)
  const queryB = new Query(world, B)
  const queryC = new Query(world, C)
  const queryD = new Query(world, D)
  const queryE = new Query(world, E)

  for (let i = count; i--;) {
    let entityId = world.createEntityId()
    world.addComponents(
      entityId
    , [A]
    , [B]
    , [C]
    , [D]
    , [E]
    )
  }

  return () => {
    packedA()
    packedB()
    packedC()
    packedD()
    packedE()
  }

  function packedA(): void {
    for (const entityId of queryA.findAllEntityIds()) {
      A.arrays.value[entityId] *= 2
    }
  }

  function packedB(): void {
    for (const entityId of queryB.findAllEntityIds()) {
      B.arrays.value[entityId] *= 2
    }
  }

  function packedC(): void {
    for (const entityId of queryC.findAllEntityIds()) {
      C.arrays.value[entityId] *= 2
    }
  }

  function packedD(): void {
    for (const entityId of queryD.findAllEntityIds()) {
      D.arrays.value[entityId] *= 2
    }
  }

  function packedE(): void {
    for (const entityId of queryE.findAllEntityIds()) {
      E.arrays.value[entityId] *= 2
    }
  }
}
