# extra-ecs
## Install
```sh
npm install --save extra-ecs
# or
yarn add extra-ecs
```

## Usage
```ts
import { RecyclableWorld, RecyclableQuery, allOf } from 'extra-ecs'

enum ComponentId {
  Enabled
, Position
, Velocity
}

const PositionAoS: Array<{
  x: number
  y: number
}> = []
const VelocityAoS: Array<{
  x: number
  y: number
}> = []

const world = new RecyclableWorld<ComponentId>()

const player = world.createEntityId()
world.addComponentIds(player, [
  ComponentId.Position
, ComponentId.Velocity
, ComponentId.Enabled
])
PositionAoS[player] = { x: 10, y: 0 }
VelocityAoS[player] = { x: 0, y: 0 }

const enemy = world.createEntityId()
world.addComponentIds(enemy, [
  ComponentId.Position
, ComponentId.Velocity
, ComponentId.Enabled
])
PositionAoS[enemy] = { x: 100, y: 0 }
VelocityAoS[enemy] = { x: -10, y: 0 }

const movableQuery = new RecyclableQuery(world, allOf(
  ComponentId.Position
, ComponentId.Velocity
, ComponentId.Enabled
))
movementSystem(deltaTime)

function movementSystem(deltaTime: number): void {
  for (const entityId of movableQuery.findAllEntityIds()) {
    PositionAoS[entityId].x += VelocityAoS[entityId].x * deltaTime
    PositionAoS[entityId].y += VelocityAoS[entityId].y * deltaTime
  }
}
```

By simplifying components to `ComponentId`,
this ECS library can be used with any component implementation,
such as [structure-of-arrays].

[structure-of-arrays]: https://github.com/BlackGlory/structure-of-arrays

## API
### Pattern
```ts
type Pattern<ComponentId extends number> =
| ComponentId
| Expression<ComponentId>

type Expression<ComponentId extends number> =
| Not<ComponentId>
| AllOf<ComponentId>
| AnyOf<ComponentId>
| OneOf<ComponentId>
```

#### and
```ts
function and<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): AllOf<ComponentId>
```

#### or
```ts
function or<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): AnyOf<ComponentId>
```

#### xor
```ts
function xor<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): OneOf<ComponentId>
```

#### not
```ts
function not<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): Not<ComponentId>
```

`not(pattern1, pattern2) = not(anyOf(pattern1, pattern2))`

#### allOf
```ts
function allOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): AllOf<ComponentId>
```

`allOf(pattern1, pattern2, pattern3) = and(and(pattern1, pattern2), pattern3)`

#### anyOf
```ts
function anyOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): AnyOf<ComponentId>
```

`anyOf(pattern1, pattern2, pattern3) = or(or(pattern1, pattern2), pattern3)`

#### oneOf
```ts
function oneOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): OneOf<ComponentId>
```

`oneOf(pattern1, pattern2, pattern3) = xor(xor(pattern1, pattern2), pattern3)`

### Recyclable
Removed entity ids will be recycled.

#### RecyclableWorld
```ts
class RecyclableWorld<ComponentId extends number> {
  findAllEntityIds(): IterableIterator<number>
  hasEntityId(entityId: number): boolean
  createEntityId(): number
  removeEntityId(entityId: number): void

  findComponentIds(entityId: number): IterableIterator<ComponentId>
  hasComponentId(entityId: number, componentId: ComponentId): boolean
  addComponentIds(entityId: number, componentIds: NonEmptyArray<ComponentId>): void
  removeComponentIds(entityId: number, componentIds: NonEmptyArray<ComponentId>): void
}
```

#### RecyclableQuery
```ts
class RecyclableQuery<ComponentId extends number> {
  constructor(
    world: RecyclableWorld<ComponentId>
  , pattern: Pattern<ComponentId>
  )

  hasEntityId(entityId: number): boolean

  findAllEntityIds(): IterableIterator<number>
  findAllEntityIdsAscending(): IterableIterator<number>

  destroy(): void
}
```

### Non-Recyclable
Removed entity ids will not be recycled.

#### NonRecyclableWorld
```ts
class NonRecyclableWorld<ComponentId extends number> {
  findAllEntityIds(): IterableIterator<number>
  hasEntityId(entityId: number): boolean
  createEntityId(): number
  removeEntityId(entityId: number): void

  findComponentIds(entityId: number): IterableIterator<ComponentId>
  hasComponentId(entityId: number, componentId: ComponentId): boolean
  addComponentIds(entityId: number, componentIds: NonEmptyArray<ComponentId>): void
  removeComponentIds(entityId: number, componentIds: NonEmptyArray<ComponentId>): void
}
```

#### NonRecyclableQuery
```ts
class NonRecyclableQuery<ComponentId extends number> {
  constructor(
    world: NonRecyclableWorld<ComponentId>
  , pattern: Pattern<ComponentId>
  )

  hasEntityId(entityId: number): boolean

  findAllEntityIds(): IterableIterator<number>

  destroy(): void
}
```
