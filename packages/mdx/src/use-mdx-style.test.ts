import { describe, expect, it } from 'vitest'
import { getMdxStyle, hasSkipClass } from './use-mdx-style'

describe('hasSkipClass', () => {
  it('returns false for undefined', () => {
    expect(hasSkipClass(undefined)).toBe(false)
  })

  it('returns false for unrelated class', () => {
    expect(hasSkipClass('some-class')).toBe(false)
  })

  it('returns true when className contains a skip keyword', () => {
    expect(hasSkipClass('button')).toBe(true)
  })

  it('returns true for example-container', () => {
    expect(hasSkipClass('example-container foo')).toBe(true)
  })

  it('does not skip typography for unrelated substring matches', () => {
    expect(hasSkipClass('discarded prose')).toBe(false)
  })
})

describe('getMdxStyle', () => {
  it('returns the style when not inside example and no skip class', () => {
    expect(getMdxStyle('text-lg', undefined, false)).toBe('text-lg')
  })

  it('returns empty string when inside example', () => {
    expect(getMdxStyle('text-lg', undefined, true)).toBe('')
  })

  it('returns empty string when className has a skip class', () => {
    expect(getMdxStyle('text-lg', 'not-mdx wrapper', false)).toBe('')
  })
})
