import { World, Query, allOf } from '../..'
import { StructureOfArrays, int32 } from 'structure-of-arrays'

export function simpleIter(count: number): () => void {
  const world = new World()

  const A = new StructureOfArrays({ value: int32 })
  const B = new StructureOfArrays({ value: int32 })
  const C = new StructureOfArrays({ value: int32 })
  const D = new StructureOfArrays({ value: int32 })
  const E = new StructureOfArrays({ value: int32 })

  const queryAB = new Query(world, allOf(A, B))
  const queryCD = new Query(world, allOf(C, D))
  const queryCE = new Query(world, allOf(C, E))

  for (let i = count; i--;) {
    const entityId1 = world.createEntityId()
    world.addComponents(
      entityId1
    , [A, { value: 0 }]
    , [B, { value: 1 }]
    )

    const entityId2 = world.createEntityId()
    world.addComponents(
      entityId2
    , [A, { value: 0 }]
    , [B, { value: 1 }]
    , [C, { value: 2 }]
    )

    const entityId3 = world.createEntityId()
    world.addComponents(
      entityId3
    , [A, { value: 0 }]
    , [B, { value: 1 }]
    , [C, { value: 2 }]
    , [D, { value: 3 }]
    )

    const entityId4 = world.createEntityId()
    world.addComponents(
      entityId4
    , [A, { value: 0 }]
    , [B, { value: 1 }]
    , [C, { value: 2 }]
    , [E, { value: 3 }]
    )
  }

  return () => {
    systemAB()
    systemCD()
    systemCE()
  }

  function systemAB(): void {
    for (const entityId of queryAB.findAllEntityIds()) {
      const temp = A.arrays.value[entityId]
      A.arrays.value[entityId] = B.arrays.value[entityId]
      B.arrays.value[entityId] = temp
    }
  }

  function systemCD(): void {
    for (const entityId of queryCD.findAllEntityIds()) {
      const temp = C.arrays.value[entityId]
      C.arrays.value[entityId] = D.arrays.value[entityId]
      D.arrays.value[entityId] = temp
    }
  }

  function systemCE(): void {
    for (const entityId of queryCE.findAllEntityIds()) {
      const temp = C.arrays.value[entityId]
      C.arrays.value[entityId] = E.arrays.value[entityId]
      E.arrays.value[entityId] = temp
    }
  }
}
