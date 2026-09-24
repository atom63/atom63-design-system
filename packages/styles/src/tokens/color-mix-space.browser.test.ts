import { afterEach, describe, expect, it } from 'vitest'
import manifest from '../../generated/atom63.tokens.json'
import { resetRoot, root } from '../test/apply-styles'

/*
 * An oklch color-mix() interpolates hue. When one operand is a slightly tinted
 * neutral (the n2–n6 surface palettes), engines disagree on that operand's hue:
 * Chromium treats a hue this close to gray as powerless and takes the other
 * operand's hue, while Firefox and WebKit interpolate from it, so the same mix
 * renders a different color per browser (up to 170/255 apart on a theme). oklab
 * has no hue, so every engine agrees. CSS Color 4 makes an oklch hue powerless
 * only at C <= 0.000004, so Firefox and WebKit follow the spec and Chromium's
 * wider threshold is the bug. The rule: an oklch mix may not take an operand
 * whose chroma is above that epsilon but low (a tinted neutral) under any
 * surface or mode; mix those in oklab. Exact grays, black and white fall under
 * the epsilon, have no hue in any engine, and are fine.
 */

const lowChroma = { min: 0.000004, max: 0.04 }

const mixes = (
  manifest as { entries: { cssVar: string; type: string; value: string; scope: string }[] }
).entries.filter(entry => entry.type === 'color' && /color-mix\(\s*in oklch/.test(entry.value))

const probe = document.createElement('div')
document.body.append(probe)

/** oklch chroma of a CSS color, or null when it does not parse. */
function chroma(color: string): number | null {
  probe.style.color = ''
  probe.style.color = `oklch(from ${color} l c h)`
  if (!probe.style.color) return null
  const match = /^oklch\(([-\d.e]+) ([-\d.e]+)/.exec(getComputedStyle(probe).color)
  return match ? Number(match[2]) : null
}

/** The var() operands of a color-mix(), in order. */
function operands(value: string): string[] {
  return [...value.matchAll(/var\((--[\w-]+)\)/g)].map(match => match[1])
}

afterEach(() => {
  resetRoot()
  for (const attribute of ['data-a63-theme', 'data-a63-surface', 'data-a63-mode'])
    root().removeAttribute(attribute)
  root().classList.remove('light', 'dark')
})

describe('color-mix interpolation space', () => {
  it('finds the oklch mixes', () => {
    expect(mixes.length).toBeGreaterThan(0)
  })

  it('never mixes a tinted neutral in oklch', () => {
    const violations = new Set<string>()
    for (const theme of ['modern', 'aqua', 'retro', 'terminal'])
      for (const surface of ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'])
        for (const mode of ['light', 'dark']) {
          const element = root()
          element.setAttribute('data-a63-theme', theme)
          element.setAttribute('data-a63-surface', surface)
          element.setAttribute('data-a63-mode', mode)
          element.classList.remove('light', 'dark')
          element.classList.add(mode)
          const styles = getComputedStyle(element)
          for (const entry of mixes) {
            for (const operand of operands(entry.value)) {
              const value = styles.getPropertyValue(operand).trim()
              const c = value && chroma(value)
              if (typeof c === 'number' && c >= lowChroma.min && c < lowChroma.max)
                violations.add(
                  `${entry.cssVar} [${entry.scope.replace(/\s+/g, ' ')}] via ${operand}`
                )
            }
          }
        }
    expect([...violations].sort()).toEqual([])
  })
})
