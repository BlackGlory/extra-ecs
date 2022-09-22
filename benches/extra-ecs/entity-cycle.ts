import { Component, int32, World, Query } from '../..'

export function entityCycle(count: number): () => void {
  const world = new World()

  const A = new Component(world, { value: int32 })
  const B = new Component(world, { value: int32 })

  const queryA = new Query(world, A)
  const queryB = new Query(world, B)

  for (let i = count; i--;) {
    const entityId = world.createEntityId()
    world.addComponents(entityId, [A, { value: i }])
  }

  return () => {
    spawnB()
    killB()
  }

  function spawnB(): void {
    for (const entityId of queryA.findAllEntityIds()) {
      world.addComponents(
        world.createEntityId()
      , [B, { value: A.getValue(entityId, 'value')! }]
      )
    }
  }

  function killB(): void {
    for (const entityId of queryB.findAllEntityIds()) {
      world.removeEntityId(entityId)
    }
  }
}
