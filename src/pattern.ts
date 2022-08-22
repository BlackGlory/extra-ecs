import { isArray, NonEmptyArray } from '@blackglory/prelude'
import { Component } from './component'

export type Pattern =
| Component
| Expression

type Expression =
| Not
| AllOf
| AnyOf
| OneOf

export enum Operator {
  Not
, AllOf
, AnyOf
, OneOf
}

type Not = [Operator.Not, ...Pattern[]]
type AllOf = [Operator.AllOf, ...Pattern[]]
type AnyOf = [Operator.AnyOf, ...Pattern[]]
type OneOf = [Operator.OneOf, ...Pattern[]]


/**
 * `not(pattern1, pattern2) = not(anyOf(pattern1, pattern2))`
 */
export function not(...patterns: NonEmptyArray<Pattern>): Not {
  return [Operator.Not, ...patterns]
}

/**
 * `allOf(pattern1, pattern2, pattern3) = and(and(pattern1, pattern2), pattern3)`
 */
export function allOf(...patterns: NonEmptyArray<Pattern>): AllOf {
  return [Operator.AllOf, ...patterns]
}

/**
 * `anyOf(pattern1, pattern2, pattern3) = or(or(pattern1, pattern2), pattern3)`
 */
export function anyOf(...patterns: NonEmptyArray<Pattern>): AnyOf {
  return [Operator.AnyOf, ...patterns]
}

/**
 * `oneOf(pattern1, pattern2, pattern3) = xor(xor(pattern1, pattern2), pattern3)`
 */
export function oneOf(...patterns: NonEmptyArray<Pattern>): OneOf {
  return [Operator.OneOf, ...patterns]
}

export function and(left: Pattern, right: Pattern): AllOf {
  return [Operator.AllOf, left, right]
}

export function or(left: Pattern, right: Pattern): AnyOf {
  return [Operator.AnyOf, left, right]
}

export function xor(left: Pattern, right: Pattern): OneOf {
  return [Operator.OneOf, left, right]
}

export function isExpression(pattern: Pattern): pattern is Expression {
  return isArray(pattern)
}

export function isNot(expression: Expression): expression is Not {
  return expression[0] === Operator.Not
}

export function isAllOf(expression: Expression): expression is AllOf {
  return expression[0] === Operator.AllOf
}

export function isAnyOf(expression: Expression): expression is AnyOf {
  return expression[0] === Operator.AnyOf
}

export function isOneOf(expression: Expression): expression is OneOf {
  return expression[0] === Operator.OneOf
}
