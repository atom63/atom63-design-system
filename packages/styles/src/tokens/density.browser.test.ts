import { afterEach, describe, expect, it } from 'vitest'
import { resetRoot, root } from '../test/apply-styles'

/*
 * [data-a63-density] (contracts/environment.css) sets --a63-space-unit. The
 * space steps, control heights, paddings and gaps are built on it at :root, and
 * a custom property that reads another resolves where it is declared, so the
 * density scope declares them again. These probes check what a nested element
 * renders with, on <html> and on a nested scope (UIProvider density="compact").
 */

const scopes: HTMLElement[] = []

afterEach(() => {
  for (const scope of scopes.splice(0)) scope.remove()
  root().removeAttribute('data-a63-density')
  resetRoot()
})

function scope(attributes: Record<string, string> = {}, parent: HTMLElement = document.body) {
  const element = document.createElement('div')
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
  parent.appendChild(element)
  if (parent === document.body) scopes.push(element)
  return element
}

/** The px a nested element renders `height: <expression>` at. */
function height(parent: HTMLElement, expression: string): string {
  const probe = document.createElement('div')
  probe.style.height = expression
  parent.appendChild(probe)
  return getComputedStyle(probe).height
}

const token = (name: string) => `var(${name})`
/** The height a control recipe draws a size at (button.css, input.css and the rest). */
const controlHeight = (size: string) =>
  `max(calc(var(--a63-control-height-${size}) * var(--a63-density-scale, 1)), var(--a63-control-min-size))`

/** What compact density renders at: the 4px unit becomes 3.5px, once. */
function expectCompact(element: HTMLElement) {
  expect(height(element, token('--a63-space-unit'))).toBe('3.5px')
  expect(height(element, token('--a63-space-4'))).toBe('14px')
  expect(height(element, token('--a63-space-1_5'))).toBe('5.25px')
  expect(height(element, token('--a63-control-height-md'))).toBe('28px')
  expect(height(element, controlHeight('md'))).toBe('28px')
  expect(height(element, controlHeight('lg'))).toBe('31.5px')
  // xs is 21px, so the 24px pointer floor holds it.
  expect(height(element, controlHeight('xs'))).toBe('24px')
  expect(height(element, token('--a63-control-padding-inline-md'))).toBe('10.5px')
  expect(height(element, token('--a63-control-gap'))).toBe('7px')
  expect(height(element, token('--a63-trigger-gap'))).toBe('7px')
  expect(height(element, token('--a63-row-padding-block-sm'))).toBe('10.5px')
  expect(height(element, token('--a63-menu-item-padding-inline'))).toBe('7px')
}

function expectComfortable(element: HTMLElement) {
  expect(height(element, token('--a63-space-4'))).toBe('16px')
  expect(height(element, controlHeight('md'))).toBe('32px')
  expect(height(element, token('--a63-control-padding-inline-md'))).toBe('12px')
  expect(height(element, token('--a63-row-padding-block-sm'))).toBe('12px')
}

describe('density', () => {
  it('leaves the default sizes alone', () => {
    expectComfortable(scope())
  })

  it('compact on <html> scales spacing and control heights once', () => {
    root().setAttribute('data-a63-density', 'compact')
    expectCompact(scope())
  })

  it('compact on a nested scope scales spacing and control heights the same way', () => {
    expectCompact(scope({ 'data-a63-density': 'compact' }))
    // The legacy attribute name works too.
    expectCompact(scope({ 'data-density': 'compact' }))
  })

  it('a nested comfortable scope restores the default sizes under a compact root', () => {
    root().setAttribute('data-a63-density', 'compact')
    expectComfortable(scope({ 'data-a63-density': 'comfortable' }))
  })

  it('keeps the iOS height ramp in a compact scope inside the iOS design language', () => {
    const ios = scope({ 'data-a63-design-language': 'ios' })
    const compact = scope({ 'data-a63-density': 'compact' }, ios)
    // iOS md is 11 units: 44px, and 38.5px at the compact unit.
    expect(height(ios, controlHeight('md'))).toBe('44px')
    expect(height(compact, controlHeight('md'))).toBe('38.5px')
    expect(height(compact, token('--a63-control-padding-inline-md'))).toBe('14px')
    // On the same element.
    const both = scope({ 'data-a63-design-language': 'ios', 'data-a63-density': 'compact' })
    expect(height(both, controlHeight('md'))).toBe('38.5px')
  })

  it('keeps the phone sizes in a compact scope inside a phone screen', () => {
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    const compact = scope({ 'data-a63-density': 'compact' }, phone)
    expect(height(compact, controlHeight('md'))).toBe('38.5px')
    expect(height(compact, token('--a63-inset-row-min-size'))).toBe('45.5px')
    expect(getComputedStyle(compact).getPropertyValue('--a63-control-font-size-md').trim()).toBe(
      getComputedStyle(phone).getPropertyValue('--a63-control-font-size-md').trim()
    )
  })

  it('does not change text sizes', () => {
    const compact = scope({ 'data-a63-density': 'compact' })
    const probe = document.createElement('span')
    probe.style.fontSize = 'var(--a63-control-font-size-md)'
    compact.appendChild(probe)
    expect(getComputedStyle(probe).fontSize).toBe('13px')
  })
})

describe('root text', () => {
  it('sets text without a size class to the body role, and keeps 1rem at 16px', () => {
    const text = document.createElement('p')
    document.body.appendChild(text)
    expect(getComputedStyle(text).fontSize).toBe('15px')
    expect(getComputedStyle(text).lineHeight).toBe('23px')
    expect(getComputedStyle(document.documentElement).fontSize).toBe('16px')
    text.remove()
  })

  it('sets the phone body role inside a phone screen', () => {
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    const text = document.createElement('p')
    phone.appendChild(text)
    expect(getComputedStyle(text).fontSize).toBe('17px')
    expect(getComputedStyle(text).lineHeight).toBe('22px')
  })
})
