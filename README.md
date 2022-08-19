# extra-ecs
## Install
```sh
npm install --save extra-ecs
# or
yarn add extra-ecs
```

## Usage
```ts
import { StructureOfArrays, double } from 'structure-of-arrays'
import { World, Query, Entity, allOf } from 'extra-ecs'

const Position = new StructureOfArrays({
  x: double
, y: double
})
const Velocity = new StructureOfArrays({
  x: double
, y: double
})

const world = new World()
const player = new Entity(world)
const enemy = new Entity(world)
player.addComponents(
  [Position, { x: 0, y: 0 }]
, [Velocity, { x: 10, y: 0 }]
)
enemy.addComponents(
  [Position, { x: 100, y: 0 }]
, [Velocitiy, { x: -10, y: 0 }]
)

const movableQuery = new Query(world, allOf(Position, Velocity))

function movementSystem(deltaTime: number): void {
  for (const entity of movableQuery.findAllEntities()) {
    const [positionIndex, velocityIndex] = entity.getComponentIndexes(Position, Velocity)
    Position.arrays.x[positionIndex!] += Velocity.arrays.x[velocityIndex!] * deltaTime
    Position.arrays.y[positionIndex!] += Velocity.arrays.y[velocityIndex!] * deltaTime
  }
}

movementSystem(deltaTime)
```

## API
### World
```ts
class World {
  getAllEntityIds(): Iterable<number>
  createEntityId(): number
  hasEntityId(entityId: number): boolean
  removeEntityId(entityId: number): void

  getComponents(entityId: number): Iterable<StructureOfArrays<any>>
  componentsExist<T extends NonEmptyArray<StructureOfArrays<any>>>(
    entityId: number
  , ...components: NonEmptyArray<StructureOfArrays<any>>
  ): MapProps<T, boolean>
  addComponents<T extends Structure>(
    entityId: number
  , ...componentValuePairs: NonEmptyArray<
      [component: StructureOfArrays<T>, value: StructurePrimitive<T>]
    >
  ): void
  removeComponents<T extends Structure>(
    entityId: number
  , ...components: NonEmptyArray<StructureOfArrays<T>>
  ): void

  getComponentIndexes<T extends NonEmptyArray<StructureOfArrays<any>>>(
    entityId: number
  , components: T
  ): MapProps<T, number | undefined>
}
```

### Entity
```ts
class Entity {
  constructor(world: World, id: number = world.createEntityId())

  exists(): boolean
  remove(): void

  getAllComponents(): Iterable<StructureOfArrays<any>> | undefined
  componentsExist<T extends NonEmptyArray<StructureOfArrays<any>>>(
    ...components: NonEmptyArray<StructureOfArrays<any>>
  ): MapProps<T, boolean>
  addComponents<T extends Structure>(
    ...componentValuePairs: NonEmptyArray<
      [component: StructureOfArrays<T>, value: StructurePrimitive<T>]
    >
  ): void
  removeComponents<T extends Structure>(
    ...components: NonEmptyArray<StructureOfArrays<T>>
  ): void

  getComponentIndexes<T extends NonEmptyArray<StructureOfArrays<any>>>(
    ...components: T
  ): MapProps<T, number | undefined>
}
```

`Entity` is an anemic model, its methods are provided in `World`.
Depending on coding style, you may not use it.

### Query
```ts
class Query {
  constructor(world: World, pattern: Pattern)

  findAllEntities(): Iterable<Entity>
  findAllEntityIds(): Iterable<number>

  destroy(): void
}
```

#### Patterns
```ts
type Pattern =
| StructureOfArrays<any>
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
