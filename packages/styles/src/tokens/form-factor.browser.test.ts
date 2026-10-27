import { afterEach, describe, expect, it } from 'vitest'
import { resetRoot, root } from '../test/apply-styles'

/*
 * [data-a63-form-factor='phone'] (contracts/environment.css) gives a subtree
 * the type steps and control sizing of a phone screen. Custom properties that
 * read other custom properties resolve where they are declared, so these
 * probes check the values a nested element actually renders with.
 */

const scopes: HTMLElement[] = []

afterEach(() => {
  for (const scope of scopes.splice(0)) scope.remove()
  resetRoot()
})

function scope(attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement('div')
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
  document.body.appendChild(element)
  scopes.push(element)
  return element
}

/** The px a nested element renders `font-size: var(<name>)` at. */
function fontSize(parent: HTMLElement, name: string): string {
  const probe = document.createElement('span')
  probe.style.fontSize = `var(${name})`
  parent.appendChild(probe)
  return getComputedStyle(probe).fontSize
}

/** The px a nested element renders `height: var(<name>)` at. */
function height(parent: HTMLElement, name: string): string {
  const probe = document.createElement('div')
  probe.style.height = `var(${name})`
  parent.appendChild(probe)
  return getComputedStyle(probe).height
}

/** The px a nested element renders `width: <expression>` at. */
function width(parent: HTMLElement, expression: string): string {
  const probe = document.createElement('div')
  probe.style.width = expression
  parent.appendChild(probe)
  return getComputedStyle(probe).width
}

describe('phone form factor', () => {
  it('sets the iOS text sizes on the type steps', () => {
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    expect(fontSize(phone, '--typography-base-font-size')).toBe('17px')
    expect(fontSize(phone, '--typography-sm-font-size')).toBe('15px')
    expect(fontSize(phone, '--typography-xs-font-size')).toBe('13px')
    expect(fontSize(phone, '--typography-2xs-font-size')).toBe('11px')
    expect(fontSize(phone, '--typography-6xl-font-size')).toBe('34px')
  })

  it('redeclares the text roles, so they follow the phone steps', () => {
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    expect(fontSize(phone, '--a63-type-body-font-size')).toBe('17px')
    expect(fontSize(phone, '--a63-type-headline-font-size')).toBe('17px')
    expect(fontSize(phone, '--a63-type-subhead-font-size')).toBe('15px')
    expect(fontSize(phone, '--a63-type-footnote-font-size')).toBe('13px')
    expect(fontSize(phone, '--a63-type-title-2-font-size')).toBe('22px')
    expect(fontSize(phone, '--a63-type-large-title-font-size')).toBe('34px')
    expect(fontSize(phone, '--a63-type-display-font-size')).toBe('40px')
  })

  it('sets control labels at body size and the iOS height ramp', () => {
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    expect(fontSize(phone, '--a63-control-font-size-xs')).toBe('13px')
    expect(fontSize(phone, '--a63-control-font-size-sm')).toBe('17px')
    expect(fontSize(phone, '--a63-control-font-size-md')).toBe('17px')
    expect(height(phone, '--a63-control-height-sm')).toBe('40px')
    expect(height(phone, '--a63-control-height-md')).toBe('44px')
  })

  it('keeps a secondary line below its title: subheadline size on a phone, sm elsewhere', () => {
    const secondary = '--a63-control-font-size-secondary, var(--a63-control-font-size-sm)'
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    expect(fontSize(phone, secondary)).toBe('15px')
    expect(fontSize(phone, '--a63-control-font-size-sm')).toBe('17px')
    expect(fontSize(scope(), secondary)).toBe('12px')
  })

  it('gives the switch the iOS 26 proportions: a wide pill knob on a 63 by 28 track', () => {
    // The Switch recipe's track: thumb × (1 + aspect) + 6px wide, thumb + 6px tall.
    const track = 'calc(var(--a63-switch-thumb-size) * (1 + var(--a63-switch-thumb-aspect)) + 6px)'
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    expect(height(phone, '--a63-switch-thumb-size')).toBe('22px')
    expect(Number.parseFloat(width(phone, track))).toBeCloseTo(63.2, 1)
    const web = scope()
    expect(height(web, '--a63-switch-thumb-size')).toBe('16px')
    expect(width(web, track)).toBe('38px')
  })

  it('gives a grouped list the iOS row height and a rounder card, on a phone only', () => {
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    expect(height(phone, '--a63-inset-row-min-size')).toBe('52px')
    expect(height(phone, '--a63-inset-group-radius')).toBe('18px')
    // Outside a phone neither is declared, so the Item recipe takes its fallbacks.
    const web = getComputedStyle(scope())
    expect(web.getPropertyValue('--a63-inset-row-min-size')).toBe('')
    expect(web.getPropertyValue('--a63-inset-group-radius')).toBe('')
  })

  it('leaves the page outside the phone scope on the web sizes', () => {
    const web = scope()
    expect(fontSize(web, '--typography-base-font-size')).toBe('15px')
    expect(fontSize(web, '--a63-type-body-font-size')).toBe('15px')
    expect(fontSize(web, '--a63-control-font-size-md')).toBe('13px')
    expect(height(web, '--a63-control-height-md')).toBe('32px')
  })

  it('keeps the type scale preference on top of the phone steps', () => {
    root().setAttribute('data-a63-type-scale', 'large')
    const phone = scope({ 'data-a63-form-factor': 'phone' })
    // 17px × 1.2
    expect(fontSize(phone, '--a63-type-body-font-size')).toBe('20.4px')
  })

  it('wins over the design language on the same element', () => {
    const phone = scope({ 'data-a63-design-language': 'ios', 'data-a63-form-factor': 'phone' })
    expect(fontSize(phone, '--a63-control-font-size-sm')).toBe('17px')
    expect(height(phone, '--a63-control-height-md')).toBe('44px')
  })
})
