# extra-ecs
## Install
```sh
npm install --save extra-ecs
# or
yarn add extra-ecs
```

## Usage
```ts
import { StructureOfArrays, float64 } from 'structure-of-arrays'
import { World, Query, allOf } from 'extra-ecs'

const Enabled = Symbol()
const Position = new StructureOfArrays({
  x: float64
, y: float64
})
const Velocity = new StructureOfArrays({
  x: float64
, y: float64
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
| StructureOfSparseMaps<T>
| symbol
```

### World
```ts
type MapComponentsToComponentValuePairs<T extends Array<Structure | Falsy>> = {
  [Index in keyof T]:
    [Exclude<T[Index], | Falsy>] extends [infer U]
    ? (
        U extends Structure
        ? (
            Equals<U, {}> extends true
            ? Falsy | [component: Component<U>]
            : Falsy | [component: Component<U>, value?: MapTypesOfStructureToPrimitives<U>]
          )
        : never
      )
    : never
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
  addComponents<T extends NonEmptyArray<Structure | Falsy>>(
    entityId: number
  , ...componentValuePairs: MapComponentsToComponentValuePairs<T>
  ): void
  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<Component<T> | Falsy>
  ): void
}
```

### Query
```ts
class Query {
  constructor(world: World, pattern: Pattern)

  hasEntityId(entityId: number): boolean
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
