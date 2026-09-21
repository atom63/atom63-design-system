import { describe, expect, it } from 'vitest'
import { arrowIndexDelta } from './direction'

describe('arrowIndexDelta', () => {
  it('follows the reading order', () => {
    expect(arrowIndexDelta('ArrowRight', false)).toBe(1)
    expect(arrowIndexDelta('ArrowLeft', false)).toBe(-1)
    expect(arrowIndexDelta('ArrowRight', true)).toBe(-1)
    expect(arrowIndexDelta('ArrowLeft', true)).toBe(1)
  })

  it('claims nothing else', () => {
    // Up and down are not reading directions, and the gallery uses neither.
    expect(arrowIndexDelta('ArrowUp', true)).toBeUndefined()
    expect(arrowIndexDelta('ArrowDown', false)).toBeUndefined()
    expect(arrowIndexDelta('Home', true)).toBeUndefined()
  })
})
