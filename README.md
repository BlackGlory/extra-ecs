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

const world = new RecyclableWorld()

const player = world.createEntityId()
world.addComponentId(player, [
  ComponentId.Position
, ComponentId.Velocity
, ComponentId.Enabled
])
PositionAoS[player] = { x: 10, y: 0 }
VelocityAoS[player] = { x: 0, y: 0 }

const enemy = world.createEntityId()
world.addComponentId(enemy, [
  ComponentId.Position
, ComponentId.Velocity
, ComponentId.Enabled
])
PositionAoS[player] = { x: 100, y: 0 }
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
### Component
```ts
type ComponentId = number
```

### Pattern
```ts
type Pattern =
| ComponentId
| Expression

type Expression =
| Not
| AllOf
| AnyOf
| OneOf
```

#### and
```ts
function and(left: Pattern, right: Pattern): AllOf
```

#### or
```ts
function or(left: Pattern, right: Pattern): AnyOf
```

#### xor
```ts
function xor(left: Pattern, right: Pattern): OneOf
```

#### not
```ts
function not(...patterns: NonEmptyArray<Pattern>): Not
```

`not(pattern1, pattern2) = not(anyOf(pattern1, pattern2))`

#### allOf
```ts
function allOf(...patterns: NonEmptyArray<Pattern>): AllOf
```

`allOf(pattern1, pattern2, pattern3) = and(and(pattern1, pattern2), pattern3)`

#### anyOf
```ts
function anyOf(...patterns: NonEmptyArray<Pattern>): AnyOf
```

`anyOf(pattern1, pattern2, pattern3) = or(or(pattern1, pattern2), pattern3)`

#### oneOf
```ts
function oneOf(...patterns: NonEmptyArray<Pattern>): OneOf
```

`oneOf(pattern1, pattern2, pattern3) = xor(xor(pattern1, pattern2), pattern3)`

### Recyclable
Removed entity ids will be recycled.

#### RecyclableWorld
```ts
class RecyclableWorld {
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
class RecyclableQuery {
  constructor(world: RecyclableWorld, pattern: Pattern)

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
class NonRecyclableWorld {
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
class NonRecyclableQuery {
  constructor(world: NonRecyclableWorld, pattern: Pattern)

  hasEntityId(entityId: number): boolean

  findAllEntityIds(): IterableIterator<number>

  destroy(): void
}
```
