import { isArray, NonEmptyArray } from '@blackglory/prelude'
import { drop } from 'iterable-operator'

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

type Not<ComponentId extends number> = [Operator.Not, ...Pattern<ComponentId>[]]
type AllOf<ComponentId extends number> = [Operator.AllOf, ...Pattern<ComponentId>[]]
type AnyOf<ComponentId extends number> = [Operator.AnyOf, ...Pattern<ComponentId>[]]
type OneOf<ComponentId extends number> = [Operator.OneOf, ...Pattern<ComponentId>[]]

/**
 * `not(pattern1, pattern2) = not(anyOf(pattern1, pattern2))`
 */
export function not<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): Not<ComponentId> {
  return [Operator.Not, ...patterns]
}

/**
 * `allOf(pattern1, pattern2, pattern3) = and(and(pattern1, pattern2), pattern3)`
 */
export function allOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): AllOf<ComponentId> {
  return [Operator.AllOf, ...patterns]
}

/**
 * `anyOf(pattern1, pattern2, pattern3) = or(or(pattern1, pattern2), pattern3)`
 */
export function anyOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): AnyOf<ComponentId> {
  return [Operator.AnyOf, ...patterns]
}

/**
 * `oneOf(pattern1, pattern2, pattern3) = xor(xor(pattern1, pattern2), pattern3)`
 */
export function oneOf<ComponentId extends number>(
  ...patterns: NonEmptyArray<Pattern<ComponentId>>
): OneOf<ComponentId> {
  return [Operator.OneOf, ...patterns]
}

export function and<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): AllOf<ComponentId> {
  return [Operator.AllOf, left, right]
}

export function or<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): AnyOf<ComponentId> {
  return [Operator.AnyOf, left, right]
}

export function xor<ComponentId extends number>(
  left: Pattern<ComponentId>
, right: Pattern<ComponentId>
): OneOf<ComponentId> {
  return [Operator.OneOf, left, right]
}

export function isExpression<ComponentId extends number>(
  pattern: Pattern<ComponentId>
): pattern is Expression<ComponentId> {
  return isArray(pattern)
}

export function isNot<ComponentId extends number>(
  expression: Expression<ComponentId>
): expression is Not<ComponentId> {
  return expression[0] === Operator.Not
}

export function isAllOf<ComponentId extends number>(
  expression: Expression<ComponentId>
): expression is AllOf<ComponentId> {
  return expression[0] === Operator.AllOf
}

export function isAnyOf<ComponentId extends number>(
  expression: Expression<ComponentId>
): expression is AnyOf<ComponentId> {
  return expression[0] === Operator.AnyOf
}

export function isOneOf<ComponentId extends number>(
  expression: Expression<ComponentId>
): expression is OneOf<ComponentId> {
  return expression[0] === Operator.OneOf
}

export function* extractComponentIds<ComponentId extends number>(
  pattern: Pattern<ComponentId>
): IterableIterator<ComponentId> {
  if (isExpression(pattern)) {
    if (isNot(pattern)) {
      for (const subPattern of drop(pattern, 1)) {
        yield* extractComponentIds(subPattern as Pattern<ComponentId>)
      }
    } else if (isAllOf(pattern)) {
      for (const subPattern of drop(pattern, 1)) {
        yield* extractComponentIds(subPattern as Pattern<ComponentId>)
      }
    } else if (isAnyOf(pattern)) {
      for (const subPattern of drop(pattern, 1)) {
        yield* extractComponentIds(subPattern as Pattern<ComponentId>)
      }
    } else if (isOneOf(pattern)) {
      for (const subPattern of drop(pattern, 1)) {
        yield* extractComponentIds(subPattern as Pattern<ComponentId>)
      }
    } else {
      throw new Error('Invalid pattern')
    }
  } else {
    yield pattern
  }
}
