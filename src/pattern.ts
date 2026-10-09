import { isNumber, NonEmptyArray } from '@blackglory/prelude'

export type Pattern<ComponentId extends number> =
| ComponentId
| Expression<ComponentId>

type Expression<ComponentId extends number> =
| Not<ComponentId>
| AllOf<ComponentId>
| AnyOf<ComponentId>
| OneOf<ComponentId>

export enum Operator {
  Not
, AllOf
, AnyOf
, OneOf
}

interface Not<ComponentId extends number> {
  type: Operator.Not
  children: Pattern<ComponentId>[]
}
interface AllOf<ComponentId extends number> {
  type: Operator.AllOf
  children: Pattern<ComponentId>[]
}
interface AnyOf<ComponentId extends number> {
  type: Operator.AnyOf
  children: Pattern<ComponentId>[]
}
interface OneOf<ComponentId extends number> {
  type: Operator.OneOf
  children: Pattern<ComponentId>[]
}

/**
 * `not(pattern1, pattern2) = not(anyOf(pattern1, pattern2))`
 */
export function not<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): Not<ComponentId> {
  return {
    type: Operator.Not
  , children: patterns
  }
}

/**
 * `allOf(pattern1, pattern2, pattern3) = and(and(pattern1, pattern2), pattern3)`
 */
export function allOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): AllOf<ComponentId> {
  return {
    type: Operator.AllOf
  , children: patterns
  }
}

/**
 * `anyOf(pattern1, pattern2, pattern3) = or(or(pattern1, pattern2), pattern3)`
 */
export function anyOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): AnyOf<ComponentId> {
  return {
    type: Operator.AnyOf
  , children: patterns
  }
}

/**
 * `oneOf(pattern1, pattern2, pattern3) = xor(xor(pattern1, pattern2), pattern3)`
 */
export function oneOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): OneOf<ComponentId> {
  return {
    type: Operator.OneOf
  , children: patterns
  }
}

export function and<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): AllOf<ComponentId> {
  return {
    type: Operator.AllOf
  , children: [left, right]
  }
}

export function or<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): AnyOf<ComponentId> {
  return {
    type: Operator.AnyOf
  , children: [left, right]
  }
}

export function xor<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): OneOf<ComponentId> {
  return {
    type: Operator.OneOf
  , children: [left, right]
  }
}

export function* extractComponentIds<ComponentId extends number>(
  pattern: Pattern<ComponentId>
): IterableIterator<ComponentId> {
  if (isNumber(pattern)) {
    yield pattern
  } else {
    for (const subPattern of pattern.children) {
      yield* extractComponentIds(subPattern as Pattern<ComponentId>)
    }
  }
}
