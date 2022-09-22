import { Component, World, Query, int32, allOf } from '../..'

export function simpleIter(count: number): () => void {
  const world = new World()

  const A = new Component(world, { value: int32 })
  const B = new Component(world, { value: int32 })
  const C = new Component(world, { value: int32 })
  const D = new Component(world, { value: int32 })
  const E = new Component(world, { value: int32 })

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
      const temp = A.getValue(entityId, 'value')!
      A.setValue(entityId, 'value', B.getValue(entityId, 'value')!)
      B.setValue(entityId, 'value', temp)
    }
  }

  function systemCD(): void {
    for (const entityId of queryCD.findAllEntityIds()) {
      const temp = C.getValue(entityId, 'value')!
      C.setValue(entityId, 'value', D.getValue(entityId, 'value')!)
      D.setValue(entityId, 'value', temp)
    }
  }

  function systemCE(): void {
    for (const entityId of queryCE.findAllEntityIds()) {
      const temp = C.getValue(entityId, 'value')!
      C.setValue(entityId, 'value', E.getValue(entityId, 'value')!)
      E.setValue(entityId, 'value', temp)
    }
  }
}
