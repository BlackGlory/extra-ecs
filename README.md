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
import { StructureOfArrays, double } from 'structure-of-arrays'
import { World, Query, allOf } from 'extra-ecs'

const Enabled = Symbol()
const Position = new StructureOfArrays({
  x: double
, y: double
})
const Velocity = new StructureOfArrays({
  x: double
, y: double
})

const world = new World()
const player = world.createEntityId()
const enemy = world.createEntityId()
world.addComponents(
  player
, [Position] // equivalent to [Position, { x: 0, y: 0 }]
, [Velocity, { x: 10, y: 0 }]
, [Enabled]
)
world.addComponents(
  enemy
, [Position, { x: 100, y: 0 }]
, [Velocitiy, { x: -10, y: 0 }]
, [Enabled]
)

const movableQuery = new Query(world, allOf(Position, Velocity, Enabled))

function movementSystem(deltaTime: number): void {
  for (const entityId of movableQuery.findAllEntityId()) {
    Position.arrays.x[entityId] += Velocity.arrays.x[entityId] * deltaTime
    Position.arrays.y[entityId] += Velocity.arrays.y[entityId] * deltaTime
  }
}

movementSystem(deltaTime)
```

## API
```ts
type Component<T extends Structure = any> =
| StructureOfArrays<T>
| symbol
```

### World
```ts
type MapComponentsToComponentValuePairs<T extends Array<Structure>> = {
  [Index in keyof T]:
    Equals<T[Index], {}> extends true
    ? [component: Component<T[Index]>]
    : [component: Component<T[Index]>, value?: MapTypesOfStructureToPrimitives<T[Index]>]
}

class World {
  getAllEntityIds(): Iterable<number>
  createEntityId(): number
  hasEntityId(entityId: number): boolean
  removeEntityId(entityId: number): void

  componentsExist<T extends NonEmptyArray<Component>>(
    entityId: number
  , ...components: T
  ): MapProps<T, boolean>
  getComponents(entityId: number): Iterable<Component>
  addComponents<T extends NonEmptyArray<Structure>>(
    entityId: number
  , ...componentValuePairs: MapComponentsToComponentValuePairs<T>
  ): void
  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<Component<T>>
  ): void
}
```

### Query
```ts
class Query {
  constructor(world: World, pattern: Pattern)

  findAllEntityIds(): Iterable<number>

  destroy(): void
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
