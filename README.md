# extra-ecs
This is an experimental project, please use it with care.

## Install
```sh
npm install --save extra-ecs
# or
yarn add extra-ecs
```

## Usage
```ts
import { World, Component, Query, allOf, double } from 'extra-ecs'

const world = new World()

const Position = new Component(world, {
  x: double
, y: double
})
const Velocity = new Component(world, {
  x: double
, y: double
})
const Available = new Component(world)

const player = world.createEntityId()
const enemy = world.createEntityId()
world.addComponents(
  player
, [Position, { x: 0, y: 0 }]
, [Velocity, { x: 10, y: 0 }]
, [Available]
)
world.addComponents(
  enemy
, [Position, { x: 100, y: 0 }]
, [Velocitiy, { x: -10, y: 0 }]
, [Available]
)

const movableQuery = new Query(world, allOf(Position, Velocity))

function movementSystem(deltaTime: number): void {
  for (const [archetype, entityId] of movableQuery.findAllEntityId()) {
    archetype.setValue(
      entityId
    , Position
    , 'x'
    , archetype.getValue(entityId, Position, 'x')
      + archetype.getValue(entityId, Velocity, 'x') * deltaTime
    )
    archetype.setValue(
      entityId
    , Position
    , 'y 
    , archetype.getValue(entityId, Position, 'y')
      + Velocity.getValue(entityId, Velocity, 'y') * deltaTime
    )
  }
}

movementSystem(deltaTime)
```

## API
### World
```ts
class World {
  createEntityId(): EntityId
  removeEntityId(entityId: EntityId): void

  addComponents<T extends Structure>(
    entityId: number
  , ...componentValuePairs: NonEmptyArray<
      [array: Component<T>, value?: MapTypesOfStructureToPrimitives<T>]
    >
  ): void
  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<Component<T>>
  ): void
}
```

### Component
```ts
class Component<T extends Structure = any> {
  readonly id: ComponentId
  readonly structure?: T

  constructor(world: World, structure?: T)
}
```

### Query
```ts
class Query {
  constructor(world: World, pattern: Pattern)

  findAllEntityIds(): Iterable<EntityId>
  destroy(): void
}
```

### Archetype
```ts
class Archetype {
  getValue(
    entityId: number
  , component: Component
  , key: string
  ): string | boolean | number | undefined

  setValue(
    entityId: number
  , component: Component
  , key: string
  , value: string | boolean | number
  ): void
}
```

#### Patterns
```ts
type Pattern =
| Component
| Expression

type Expression =
| Not
| AllOf
| AnyOf
| OneOf
```

##### and
```ts
function and(left: Pattern, right: Pattern): AllOf
```

##### or
```ts
function or(left: Pattern, right: Pattern): AnyOf
```

##### xor
```ts
function xor(left: Pattern, right: Pattern): OneOf
```

##### not
```ts
function not(...patterns: NonEmptyArray<Pattern>): Not
```

`not(pattern1, pattern2) = not(anyOf(pattern1, pattern2))`

##### allOf
```ts
function allOf(...patterns: NonEmptyArray<Pattern>): AllOf
```

`allOf(pattern1, pattern2, pattern3) = and(and(pattern1, pattern2), pattern3)`

##### anyOf
```ts
function anyOf(...patterns: NonEmptyArray<Pattern>): AnyOf
```

`anyOf(pattern1, pattern2, pattern3) = or(or(pattern1, pattern2), pattern3)`

##### oneOf
```ts
function oneOf(...patterns: NonEmptyArray<Pattern>): OneOf
```

`oneOf(pattern1, pattern2, pattern3) = xor(xor(pattern1, pattern2), pattern3)`
