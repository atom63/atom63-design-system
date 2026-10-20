import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { rootOnlyReadsOfScoped } from './token-scope.mjs'

/*
 * Root-only tokens that read scoped tokens and predate this check. A nested
 * radius, density or theme scope does not recompute them (for example a
 * nested [data-a63-radius='round'] changes --radius-multiplier but inherits the
 * root's --radius-lg). Fix them by declaring them where what they read is
 * declared, then delete them here; the list may only shrink.
 */
const KNOWN = [
  '--a63-action-control-border-width',
  '--a63-action-control-focus-ring-width',
  '--a63-action-control-gloss',
  '--a63-action-control-highlight',
  '--a63-action-control-press-transform',
  '--a63-action-control-radius',
  '--a63-action-control-shadow',
  '--a63-action-control-shadow-active',
  '--a63-action-control-shadow-flat',
  '--a63-action-control-shadow-tint',
  '--a63-action-control-text-shadow',
  '--a63-choice-border-width',
  '--a63-choice-feedback-ease',
  '--a63-choice-focus-ring-width',
  '--a63-choice-switch-thumb-size',
  '--a63-menu-item-font-size',
  '--a63-segment-border-width',
  '--a63-skeleton-base',
  '--a63-space-0_5',
  '--a63-space-1',
  '--a63-space-1_5',
  '--a63-space-2',
  '--a63-space-2_5',
  '--a63-space-3',
  '--a63-space-3_5',
  '--a63-space-4',
  '--a63-space-5',
  '--a63-space-6',
  '--a63-toggle-radius',
  '--a63-trigger-border-width',
  '--a63-trigger-feedback-ease',
  '--a63-trigger-focus-ring-width',
  '--a63-trigger-radius',
  '--a63-widget-border-color',
  '--a63-widget-border-style',
  '--a63-widget-rim-color',
  '--radius',
  '--radius-2xl',
  '--radius-2xs',
  '--radius-3xl',
  '--radius-4xl',
  '--radius-lg',
  '--radius-md',
  '--radius-sm',
  '--radius-xl',
  '--radius-xs',
]

test('finds a root-only token that reads a token another selector redeclares', () => {
  const entries = [
    { cssVar: '--a', scope: ':root', value: 'red' },
    { cssVar: '--a', scope: '.dark', value: 'blue' },
    { cssVar: '--b', scope: ':root', value: 'color-mix(in oklch, var(--a) 12%, transparent)' },
    { cssVar: '--c', scope: ':root', value: 'var(--b)' },
    { cssVar: '--d', scope: ':root', value: 'var(--a)' },
    { cssVar: '--d', scope: '.dark', value: 'var(--a)' },
  ]
  assert.deepEqual(rootOnlyReadsOfScoped(entries), [['--b', ['--a']]])
})

test('no new root-only token reads a scoped token, and fixed ones leave the list', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const manifest = JSON.parse(readFileSync(path.join(root, 'generated/atom63.tokens.json'), 'utf8'))
  const found = rootOnlyReadsOfScoped(manifest.entries).map(([token]) => token)
  assert.deepEqual(
    found.filter(token => !KNOWN.includes(token)),
    [],
    'declare these in the same contexts as the tokens they read'
  )
  assert.deepEqual(
    KNOWN.filter(token => !found.includes(token)),
    [],
    'these no longer read a scoped token from :root; remove them from KNOWN'
  )
})
