import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  findRestatements,
  findUnreachableBaseDefs,
  findUnusedThemePrivate,
  parseCssBlocks,
} from './token-economy.mjs'

const base = { selector: ':root, .light', decls: { '--a': 'red', '--b': '2px' } }

describe('parseCssBlocks', () => {
  it('captures custom-property decls per selector, ignoring comments', () => {
    const css = `
      /* a comment */
      :root, .light { --a: 1px; --b: red; }
      .dark { --b: black; }
    `
    assert.deepEqual(parseCssBlocks(css), [
      { selector: ':root, .light', decls: { '--a': '1px', '--b': 'red' } },
      { selector: '.dark', decls: { '--b': 'black' } },
    ])
  })

  it('joins nested at-rule/selector paths and only keeps custom props', () => {
    const css = `@layer components { [data-a63-theme="aqua"] { color: red; --x: 2px; } }`
    assert.deepEqual(parseCssBlocks(css), [
      { selector: '@layer components > [data-a63-theme="aqua"]', decls: { '--x': '2px' } },
    ])
  })

  it('normalizes whitespace in values', () => {
    const css = `:root { --g:  linear-gradient(  red ,  blue ) ; }`
    assert.equal(parseCssBlocks(css)[0].decls['--g'], 'linear-gradient( red , blue )')
  })
})

describe('findRestatements', () => {
  it('flags a child scope that restates the base value verbatim', () => {
    const child = { selector: '[data-a63-theme="aqua"]', decls: { '--a': 'red', '--b': '4px' } }
    assert.deepEqual(findRestatements([base, child]), [
      { token: '--a', selector: '[data-a63-theme="aqua"]', value: 'red' },
    ])
  })

  it('recognizes base tokens defined inside @layer / @media wrappers', () => {
    const blocks = [
      { selector: '@layer components > :root, .light', decls: { '--w': 'gray' } },
      { selector: '[data-a63-theme="retro"]', decls: { '--w': 'gray' } },
    ]
    assert.deepEqual(findRestatements(blocks), [
      { token: '--w', selector: '[data-a63-theme="retro"]', value: 'gray' },
    ])
  })
})

describe('findUnreachableBaseDefs', () => {
  it('flags a theme base def overridden in BOTH :not(.dark) and .dark', () => {
    const blocks = [
      { selector: '[data-a63-theme="aqua"]', decls: { '--x': 'A' } },
      { selector: '[data-a63-theme="aqua"]:not(.dark)', decls: { '--x': 'B' } },
      { selector: '[data-a63-theme="aqua"].dark', decls: { '--x': 'C' } },
    ]
    assert.deepEqual(findUnreachableBaseDefs(blocks), [{ token: '--x', theme: 'aqua' }])
  })

  it('does NOT flag when only one mode overrides', () => {
    const blocks = [
      { selector: '[data-a63-theme="aqua"]', decls: { '--x': 'A' } },
      { selector: '[data-a63-theme="aqua"].dark', decls: { '--x': 'C' } },
    ]
    assert.deepEqual(findUnreachableBaseDefs(blocks), [])
  })

  it('does NOT flag a base def overridden only in :not(.dark)', () => {
    const blocks = [
      { selector: '[data-a63-theme="aqua"]', decls: { '--x': 'A' } },
      { selector: '[data-a63-theme="aqua"]:not(.dark)', decls: { '--x': 'B' } },
    ]
    assert.deepEqual(findUnreachableBaseDefs(blocks), [])
  })
})

describe('findUnusedThemePrivate', () => {
  it('flags --theme-* defined but never referenced', () => {
    const defined = new Set(['--theme-aqua-glow', '--theme-aqua-used'])
    const referenced = new Set(['--theme-aqua-used'])
    assert.deepEqual(findUnusedThemePrivate(defined, referenced), ['--theme-aqua-glow'])
  })
})
