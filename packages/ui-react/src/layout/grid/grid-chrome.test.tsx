// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Container } from '../container'
import { GridChrome } from './chrome'
import { GridGuides } from './guides'
import { GridRule } from './rule'
import { GRID_CHROME_VARS } from './style'

describe('GridChrome styling contract', () => {
  it('emits shared grid CSS variables from the chrome root', () => {
    const { container } = render(
      <GridChrome
        style={{
          [GRID_CHROME_VARS.lineColor]: 'red',
          [GRID_CHROME_VARS.guideColor]: 'blue',
          [GRID_CHROME_VARS.crosshairColor]: 'green',
        }}
      >
        <GridRule />
        <GridGuides />
      </GridChrome>
    )

    const chrome = container.querySelector('[data-slot="grid-chrome"]') as HTMLElement
    expect(chrome.style.getPropertyValue(GRID_CHROME_VARS.lineColor)).toBe('red')
    expect(chrome.style.getPropertyValue(GRID_CHROME_VARS.guideColor)).toBe('blue')
    expect(chrome.style.getPropertyValue(GRID_CHROME_VARS.crosshairColor)).toBe('green')
    expect(chrome.style.getPropertyValue(GRID_CHROME_VARS.hairlineWidth)).toBe('1px')
    expect(chrome.style.getPropertyValue(GRID_CHROME_VARS.lineStyle)).toBe('dashed')
  })

  it('uses shared variables for rails, rules, guides, crosshairs, and container rails', () => {
    const { container } = render(
      <GridChrome fixedRails={false}>
        <Container chrome="grid">
          <GridRule />
          <GridGuides />
        </Container>
      </GridChrome>
    )

    expect(container.querySelector('[data-slot="container"]')?.className).toContain(
      'border-[color:var(--a63-grid-line-color'
    )
    expect(container.querySelector('[data-slot="grid-rule-line"]')?.className).toContain(
      'border-[color:var(--a63-grid-line-color'
    )
    expect(container.querySelector('[data-slot="grid-guide"]')?.className).toContain(
      'border-[color:var(--a63-grid-guide-color'
    )
    expect(container.querySelector('[data-slot="container"]')?.className).toContain('border-dashed')
    expect(container.querySelector('[data-slot="grid-rule-line"]')?.className).toContain(
      'border-dashed'
    )
    expect(container.querySelector('[data-slot="grid-guide"]')?.className).toContain(
      'border-dashed'
    )
    expect(container.querySelector('[data-slot="grid-rule"]')?.getAttribute('style')).toContain(
      'var(--a63-grid-hairline-width'
    )
    expect(
      container.querySelector('[data-slot="grid-rule-crosshairs"] svg')?.getAttribute('class')
    ).toContain('text-[color:var(--a63-grid-crosshair-color')
  })
})
