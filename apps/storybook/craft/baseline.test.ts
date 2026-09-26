import { describe, expect, it } from 'vitest'

import { compareToBaseline, countViolations, mergeBaseline, totals } from './baseline'

const violations = [
  { rule: 'target-size', element: 'button "Close"' },
  { rule: 'target-size', element: 'button "Close"' },
  { rule: 'focus-visible', element: 'a "Docs"' },
]

describe('runtime craft baseline', () => {
  it('counts violations per rule and element, sorted', () => {
    expect(countViolations(violations)).toEqual({
      'focus-visible': { 'a "Docs"': 1 },
      'target-size': { 'button "Close"': 2 },
    })
    expect(Object.keys(countViolations(violations))).toEqual(['focus-visible', 'target-size'])
  })

  it('reports new violations and entries that no longer occur', () => {
    const current = countViolations(violations)
    expect(compareToBaseline(current, current)).toEqual({ added: [], resolved: [] })
    expect(compareToBaseline(current, { 'target-size': { 'button "Close"': 1 } })).toEqual({
      added: [
        { key: 'focus-visible | a "Docs"', count: 1 },
        { key: 'target-size | button "Close"', count: 1 },
      ],
      resolved: [],
    })
    expect(compareToBaseline({}, { 'disabled-hover': { 'button "Save"': 1 } }).resolved).toEqual([
      { key: 'disabled-hover | button "Save"', count: 1 },
    ])
  })

  it('merges a partial run and replaces the whole baseline after a complete one', () => {
    const baseline = {
      'a--one': { 'target-size': { 'button "X"': 1 } },
      'b--two': { 'focus-visible': { 'a "Y"': 1 } },
    }
    const results = new Map([
      ['a--one', {}],
      ['c--three', countViolations(violations)],
    ])
    expect(mergeBaseline(baseline, results, { complete: false })).toEqual({
      'b--two': baseline['b--two'],
      'c--three': countViolations(violations),
    })
    expect(mergeBaseline(baseline, results, { complete: true })).toEqual({
      'c--three': countViolations(violations),
    })
    expect(totals({ 'c--three': countViolations(violations) })).toEqual({
      'focus-visible': 1,
      'target-size': 2,
    })
  })
})
