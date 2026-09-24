import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { compareToBaseline, countViolations, scanCss, scanSource } from './craft-rules.mjs'

const rules = found => found.map(({ rule, match, line }) => `${line} ${rule} ${match}`)

describe('scanCss', () => {
  it('flags literal colors but passes tokens, transparent and the #0000 idiom', () => {
    const css = `
      .a { color: #fff; }
      .b { --shadow: 0 0 #0000; background: transparent; }
      .c { border-color: rgb(0 0 0 / 10%); color: var(--a63-text-primary); }
      .d { color: oklch(0.5 0.1 200); fill: oklch(from var(--x) l c h); }
    `
    assert.deepEqual(rules(scanCss(css)), [
      '2 raw-color color: #fff',
      '4 raw-color border-color: rgb(',
      '5 raw-color color: oklch(',
    ])
  })

  it('flags physical spacing, side borders, corner radii and text alignment', () => {
    const css = `.a {
  margin-left: 1px;
  padding-inline-start: 1px;
  border-right-color: red;
  border-top-left-radius: 2px;
  text-align: right;
  text-align: start;
  left: 0;
}`
    assert.deepEqual(
      rules(scanCss(css)).filter(line => line.includes('physical')),
      [
        '2 physical-properties margin-left',
        '4 physical-properties border-right-color',
        '5 physical-properties border-top-left-radius',
        '6 physical-properties text-align: right',
      ]
    )
  })

  it('flags :focus rules that draw a ring, but not resets, :focus-visible or :focus-within', () => {
    const css = `
      .a:focus { box-shadow: 0 0 0 2px var(--a63-focus-ring); }
      .b:focus, .b:focus-visible { outline: none; }
      .c:focus-visible, .d:focus-within { outline: 2px solid var(--a63-focus-ring); }
      /* .e:focus in a comment */
    `
    assert.deepEqual(rules(scanCss(css)), ['2 focus-visible .a:focus'])
  })

  it('passes colors in masks, which only carry alpha', () => {
    const css = `.a { mask-image: linear-gradient(#000, #0000); -webkit-mask: linear-gradient(#000, transparent); }`
    assert.deepEqual(scanCss(css), [])
  })
})

describe('scanSource', () => {
  it('flags palette and arbitrary color utilities, with or without variants', () => {
    const source = `const a = cn('bg-black/70 text-foreground', "hover:text-red-500", \`border-[#ccc]\`)
// bg-white in a comment
const b = 'bg-[var(--a63-surface-page)] text-[color-mix(in_oklab,var(--x),transparent)]'`
    assert.deepEqual(rules(scanSource(source)), [
      '1 raw-color bg-black/70',
      '1 raw-color hover:text-red-500',
      '1 raw-color border-[#ccc]',
    ])
  })

  it('flags physical utilities and focus variants', () => {
    const source = `<div className="ms-2 ml-2 -mr-1 md:pl-4 text-left text-start border-l rounded-tr-md left-0 focus-visible:ring focus:ring group-focus:opacity-100 focus:outline-none pl-[env(safe-area-inset-left)]" />
<p>right-to-left text</p>`
    assert.deepEqual(rules(scanSource(source)), [
      '1 physical-properties ml-2',
      '1 physical-properties -mr-1',
      '1 physical-properties md:pl-4',
      '1 physical-properties text-left',
      '1 physical-properties border-l',
      '1 physical-properties rounded-tr-md',
      '1 focus-visible focus:ring',
      '1 focus-visible group-focus:opacity-100',
    ])
  })
})

describe('baseline', () => {
  const violations = [
    { file: 'a.css', rule: 'raw-color', match: 'color: #fff' },
    { file: 'a.css', rule: 'raw-color', match: 'color: #fff' },
    { file: 'b.tsx', rule: 'focus-visible', match: 'focus:ring' },
  ]

  it('counts violations per rule, file and match', () => {
    assert.deepEqual(countViolations(violations), {
      'focus-visible | b.tsx | focus:ring': 1,
      'raw-color | a.css | color: #fff': 2,
    })
  })

  it('reports new violations and stale baseline entries', () => {
    const current = countViolations(violations)
    const baseline = {
      'raw-color | a.css | color: #fff': 1,
      'physical-properties | c.css | margin-left': 1,
    }
    assert.deepEqual(compareToBaseline(current, baseline), {
      added: [
        { key: 'focus-visible | b.tsx | focus:ring', count: 1 },
        { key: 'raw-color | a.css | color: #fff', count: 1 },
      ],
      resolved: [{ key: 'physical-properties | c.css | margin-left', count: 1 }],
    })
  })
})
