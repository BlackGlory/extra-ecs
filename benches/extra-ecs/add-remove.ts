import { Component, World, Query } from '../..'

export function addRemove(count: number): () => void {
  const world = new World()

  const A = new Component(world)
  const B = new Component(world)

  const queryA = new Query(world, A)
  const queryB = new Query(world, B)

  for (let i = count; i--;) {
    const entityId = world.createEntityId()
    world.addComponents(entityId, [A])
  }

  return () => {
    addB()
    removeB()
  }

  function addB(): void {
    for (const entityId of queryA.findAllEntityIds()) {
      world.addComponents(entityId, [B])
    }
  }

  function removeB(): void {
    for (const entityId of queryB.findAllEntityIds()) {
      world.removeComponents(entityId, B)
    }
  }
}
