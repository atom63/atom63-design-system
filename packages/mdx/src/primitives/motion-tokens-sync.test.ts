/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { motionDurations } from './motion-tokens'

/**
 * Guards the two sources of motion durations from drifting: the TS tokens
 * (seconds, consumed by the `motion` library) and the CSS custom properties
 * (milliseconds, consumed by CSS transitions).
 *
 * The `.css` is read from disk rather than imported because vitest returns an
 * empty string for `?raw` imports of `.css`.
 */
// import.meta.dirname → this file's directory (src/primitives) under Node/vitest.
const cssPath = resolve(import.meta.dirname, './motion-tokens.css')
const motionCss = readFileSync(cssPath, 'utf8')

function readCssMs(name: string): number {
  const match = motionCss.match(new RegExp(`--mdx-motion-${name}:\\s*([\\d.]+)ms`))
  if (!match) {
    throw new Error(`--mdx-motion-${name} not found in ${cssPath}`)
  }
  return Number(match[1])
}

describe('motion token sync (TS <-> CSS)', () => {
  it.each(['fast', 'base', 'slow'] as const)(
    '%s: motionDurations (s) matches motion.css (ms)',
    speed => {
      expect(readCssMs(speed)).toBe(motionDurations[speed] * 1000)
    }
  )
})
