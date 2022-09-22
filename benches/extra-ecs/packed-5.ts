import { Component, World, Query, int32 } from '../..'

export function packed5(count: number): () => void {
  const world = new World()

  const A = new Component(world, { value: int32 })
  const B = new Component(world, { value: int32 })
  const C = new Component(world, { value: int32 })
  const D = new Component(world, { value: int32 })
  const E = new Component(world, { value: int32 })

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
      A.setValue(entityId, 'value', A.getValue(entityId, 'value')! * 2)
    }
  }

  function packedB(): void {
    for (const entityId of queryB.findAllEntityIds()) {
      B.setValue(entityId, 'value', B.getValue(entityId, 'value')! * 2)
    }
  }

  function packedC(): void {
    for (const entityId of queryC.findAllEntityIds()) {
      C.setValue(entityId, 'value', C.getValue(entityId, 'value')! * 2)
    }
  }

  function packedD(): void {
    for (const entityId of queryD.findAllEntityIds()) {
      D.setValue(entityId, 'value', D.getValue(entityId, 'value')! * 2)
    }
  }

  function packedE(): void {
    for (const entityId of queryE.findAllEntityIds()) {
      E.setValue(entityId, 'value', E.getValue(entityId, 'value')! * 2)
    }
  }
}
