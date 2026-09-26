import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { declarations } from '../test/css'
import {
  WidgetBlock,
  WidgetBlockContent,
  WidgetBlockFooter,
  WidgetBlockHeader,
  WidgetCard,
  WidgetCardContent,
  WidgetCardHeader,
  WidgetCardHeaderLeft,
  WidgetCardHeaderRight,
  WidgetCardRow,
  WidgetCardTextGroup,
  WidgetCardTitle,
} from './widget-card'

function card(container: HTMLElement): Element | null {
  return container.querySelector('[data-slot="widget-card"]')
}

/** The inner face nested inside the rim shell — where the material + className live. */
function cardFace(container: HTMLElement): Element | null {
  return card(container)?.firstElementChild ?? null
}

describe('WidgetCard', () => {
  it('renders through the WidgetSurface primitive', () => {
    const { container } = render(<WidgetCard size="large">x</WidgetCard>)
    const el = card(container)
    expect(el).not.toBeNull()
    expect(el?.hasAttribute('data-widget-surface')).toBe(true)
    expect(el).toHaveClass('a63-WidgetSurface')
    expect(el?.getAttribute('data-widget-surface-size')).toBe('large')
  })

  it('keeps the hover-group marker and the positioned face class on the face', () => {
    const { container } = render(<WidgetCard size="large">x</WidgetCard>)
    const el = cardFace(container)
    expect(el).toHaveClass('group', 'a63-WidgetCard', 'a63-WidgetSurface-body')
    expect(declarations('.a63-WidgetSurface-body').position).toBe('relative')
  })

  it('applies the themed widget chrome on the face', () => {
    const { container } = render(<WidgetCard size="large">x</WidgetCard>)
    expect(cardFace(container)).toHaveClass('a63-WidgetSurface-face')
  })

  it('passes className to the face and arbitrary props to the surface root', () => {
    const { container } = render(
      <WidgetCard size="large" className="custom-class" data-foo="bar">
        x
      </WidgetCard>
    )
    expect(cardFace(container)).toHaveClass('custom-class')
    expect(card(container)?.getAttribute('data-foo')).toBe('bar')
  })

  it('forwards size to the surface context (attribute + hook)', () => {
    const { container } = render(<WidgetCard size="medium">x</WidgetCard>)
    const el = card(container)
    expect(el?.getAttribute('data-widget-surface-size')).toBe('medium')
  })

  it('steps the card gap and header height up for the large footprint', () => {
    expect(declarations('.a63-WidgetCard').gap).toBe('var(--a63-space-2)')
    expect(declarations("[data-widget-surface-size='large'] > .a63-WidgetCard").gap).toBe(
      'var(--a63-space-3)'
    )
    expect(declarations('.a63-WidgetCardHeader')['block-size']).toBe(
      'calc(var(--a63-space-1) * 11)'
    )
    expect(declarations(".a63-WidgetCardHeader[data-size='large']")['block-size']).toBe(
      'calc(var(--a63-space-1) * 12)'
    )
  })

  it.each([
    { inset: 16, size: 'small' },
    { inset: 22, size: 'medium' },
    { inset: 22, size: 'large' },
  ] as const)('applies the $size footprint density to shared chrome', ({ inset, size }) => {
    const { container } = render(
      <WidgetCard size={size}>
        <WidgetCardHeader>h</WidgetCardHeader>
        <WidgetCardContent>b</WidgetCardContent>
      </WidgetCard>
    )
    expect(container.querySelector('[data-slot="widget-card-header"]')).toHaveAttribute(
      'data-size',
      size
    )
    expect(
      container.querySelector('[data-slot="widget-card-header"]')?.getAttribute('style') ?? ''
    ).toContain(`calc(${inset} * var(--widget-u`)
    expect(
      container.querySelector('[data-slot="widget-card-content"]')?.getAttribute('style') ?? ''
    ).toContain(`calc(${inset} * var(--widget-u`)
  })

  it('uses the quiet shared hierarchy for widget header labels', () => {
    const { container } = render(
      <WidgetCard size="small">
        <WidgetCardHeader>
          <WidgetCardTitle>Recent activity</WidgetCardTitle>
        </WidgetCardHeader>
      </WidgetCard>
    )
    const title = container.querySelector('[data-slot="widget-card-title-text"]')
    expect(title).toHaveClass('a63-WidgetCardTitle-text')
    expect(declarations('.a63-WidgetCardTitle-text').color).toBe(
      'color-mix(in oklab, var(--a63-text-secondary) 70%, transparent)'
    )
    expect(title).toHaveStyle({
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
    })
    expect(title?.getAttribute('style') ?? '').toContain('max(10px')
  })

  it('keeps the chrome leading icon on the same scale as the label', () => {
    const { container } = render(
      <WidgetCard size="large">
        <WidgetCardHeader>
          <WidgetCardTitle icon={<svg className="size-4" />}>Activity</WidgetCardTitle>
        </WidgetCardHeader>
      </WidgetCard>
    )

    const icon = container.querySelector('[data-slot="widget-card-title-icon"]')
    expect(icon).toHaveClass('a63-WidgetCardTitle-icon')
    expect(declarations('.a63-WidgetCardTitle-icon > svg')['inline-size']).toBe('100%')
    expect(icon?.getAttribute('style') ?? '').toContain('max(11px')
    expect(declarations('.a63-WidgetCardTitle').gap).toBe('var(--a63-space-0_5)')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <WidgetCard size="medium">
        <WidgetCardHeader>
          <WidgetCardHeaderLeft>
            <WidgetCardTitle icon={<svg aria-hidden />}>Activity</WidgetCardTitle>
          </WidgetCardHeaderLeft>
          <WidgetCardHeaderRight>
            <button type="button">Refresh</button>
          </WidgetCardHeaderRight>
        </WidgetCardHeader>
        <WidgetCardContent>
          <WidgetCardTextGroup>
            <p>Body copy</p>
            <WidgetCardRow>Row</WidgetCardRow>
          </WidgetCardTextGroup>
        </WidgetCardContent>
      </WidgetCard>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('WidgetBlock', () => {
  it('stamps block slot regions', () => {
    const { container } = render(
      <WidgetBlock>
        <WidgetBlockHeader>h</WidgetBlockHeader>
        <WidgetBlockContent>c</WidgetBlockContent>
        <WidgetBlockFooter>f</WidgetBlockFooter>
      </WidgetBlock>
    )
    expect(container.querySelector('[data-slot="widget-block"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="widget-block-header"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="widget-block-content"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="widget-block-footer"]')).toBeTruthy()
  })
})

describe('WidgetCardTitle descender relief', () => {
  // `truncate` sets overflow:hidden and the chrome role's leading is 1, so the
  // clip box is shorter than the font's own box and descenders were shaved.
  it('pads the clip box and returns the space, so glyphs are whole and nothing moves', () => {
    const { container } = render(
      <WidgetCard size="medium">
        <WidgetCardHeader>
          <WidgetCardTitle>Open Source</WidgetCardTitle>
        </WidgetCardHeader>
      </WidgetCard>
    )

    const text = container.querySelector('[data-slot="widget-card-title-text"]')
    expect(text).toHaveStyle({ paddingBottom: '0.24em', marginBottom: '-0.24em' })
  })
})
