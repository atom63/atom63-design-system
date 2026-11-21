import assert from 'node:assert/strict'
import { it } from 'node:test'

import { sortLiteralUnions } from './api-report-format.mjs'

it('sorts string-literal unions and leaves tuples and other types alone', () => {
  const report = [
    'export const sizes: ("md" | "lg" | "sm" | "icon-xs")[];',
    'export type Tone = "neutral" | "accent";',
    'states: readonly ["rest", "hover", "focus-visible"];',
    'value: string | number;',
  ].join('\n')
  assert.equal(
    sortLiteralUnions(report),
    [
      'export const sizes: ("icon-xs" | "lg" | "md" | "sm")[];',
      'export type Tone = "accent" | "neutral";',
      'states: readonly ["rest", "hover", "focus-visible"];',
      'value: string | number;',
    ].join('\n')
  )
})
