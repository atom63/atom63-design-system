import { afterEach, describe, expect, it } from 'vitest'
import '../test/apply-styles'
import './shadcn.css'

afterEach(() => document.body.replaceChildren())

/** The color a custom property paints on an element, as computed sRGB. */
function painted(element: HTMLElement, property: string): string {
  const probe = document.createElement('div')
  probe.style.backgroundColor = `var(${property})`
  element.appendChild(probe)
  return getComputedStyle(probe).backgroundColor
}

describe('shadcn compat bridge', () => {
  it('follows a nested dark subtree', () => {
    const dark = document.createElement('div')
    dark.className = 'dark'
    document.body.appendChild(dark)
    expect(painted(dark, '--sidebar')).toBe(painted(dark, '--a63-surface-sidebar'))
    expect(painted(dark, '--sidebar')).not.toBe(painted(document.body, '--sidebar'))
  })
})
