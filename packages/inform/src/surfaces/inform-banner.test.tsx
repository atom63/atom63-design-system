import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { declarations } from '../test/css'
import { SLOT_SIZE_CLASS } from './control-slot'
import { InformBanner } from './inform-banner'

describe('InformBanner', () => {
  it('renders the body inside a polite status region', () => {
    render(<InformBanner body="Design system work in progress." />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Design system work in progress.')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('renders a title when provided', () => {
    render(<InformBanner body="Body" title="Heads up" />)

    expect(screen.getByText('Heads up')).toBeInTheDocument()
  })

  it('renders no dismiss control by default', () => {
    render(<InformBanner body="Body" />)

    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it('calls onDismiss when the dismiss control is activated', async () => {
    const onDismiss = vi.fn()
    render(<InformBanner body="Body" dismissable onDismiss={onDismiss} />)

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('exposes the dismiss control to the keyboard', async () => {
    const onDismiss = vi.fn()
    render(<InformBanner body="Body" dismissable onDismiss={onDismiss} />)

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('renders actions and invokes them', async () => {
    const onSelect = vi.fn()
    render(<InformBanner actions={[{ id: 'read', label: 'Read more', onSelect }]} body="Body" />)

    await userEvent.click(screen.getByRole('button', { name: 'Read more' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('marks the severity on the element for styling hooks', () => {
    render(<InformBanner body="Body" severity="warning" />)

    expect(screen.getByRole('status')).toHaveAttribute('data-severity', 'warning')
  })

  /*
   * The banner centres its row, so the control needs no per-control nudge: the
   * 24px control and the text block share one centre line. Real-browser
   * measurement is what proves the alignment; this pins the mechanism.
   */
  /*
   * Title and body carry no margins, so without this their line boxes touch and
   * only the leading separates them — measured at 0px of box gap, which read as
   * a run-on rather than a pair.
   */
  it('separates the title from the body', () => {
    render(<InformBanner body="Body" title="Heads up" />)

    const block = screen
      .getByRole('status')
      .querySelector('[data-slot="inform-icon"]')?.nextElementSibling
    expect(block).toHaveClass('a63-Inform-content')
    expect(declarations('.a63-Inform-content')).toMatchObject({
      'flex-direction': 'column',
      gap: 'var(--a63-space-1)',
    })
  })

  /*
   * A banner is a single-line bar. It takes `media` in the shared content shape
   * because a registry message carries one object to every surface, but it has
   * nowhere to put it — that is a decision, so it is pinned here rather than
   * left to look like an omission.
   */
  it('ignores media, having nowhere to put it', () => {
    render(<InformBanner body="Body" media={<img alt="" src="x.png" />} title="T" />)

    const banner = screen.getByRole('status')
    expect(banner.querySelector('[data-slot="inform-thumbnail"]')).toBeNull()
    expect(banner.querySelector('[data-slot="inform-media"]')).toBeNull()
    expect(banner.querySelector('img')).toBeNull()
  })

  it('lays the row out from the top, with start-aligned text', () => {
    render(<InformBanner body="Body" dismissable />)

    expect(screen.getByRole('status')).toHaveClass('a63-InformBanner')
    expect(declarations('.a63-InformBanner')).toMatchObject({
      'align-items': 'flex-start',
      'text-align': 'start',
    })
  })

  it('renders a custom leading icon in a line-sized slot', () => {
    render(<InformBanner body="Body" icon={<svg data-testid="glyph" />} />)

    const slot = screen.getByRole('status').querySelector('[data-slot="inform-icon"]')
    expect(slot).not.toBeNull()
    expect(slot).toHaveClass(SLOT_SIZE_CLASS)
    expect(screen.getByTestId('glyph')).toBeInTheDocument()
  })

  it('falls back to the severity glyph when no icon is given', () => {
    render(<InformBanner body="Body" severity="warning" />)

    const slot = screen.getByRole('status').querySelector('[data-slot="inform-icon"]')
    expect(slot).not.toBeNull()
    expect(slot?.querySelector('svg')).not.toBeNull()
  })

  it('renders no icon slot when the icon is explicitly null', () => {
    render(<InformBanner body="Body" icon={null} />)

    expect(screen.getByRole('status').querySelector('[data-slot="inform-icon"]')).toBeNull()
  })

  /*
   * The glyph is decorative: severity is carried by the message text, so it
   * must not add a second announcement to the surface's role="status".
   */
  it('hides the default glyph from assistive technology', () => {
    render(<InformBanner body="Body" severity="danger" />)

    const svg = screen.getByRole('status').querySelector('[data-slot="inform-icon"] svg')
    expect(svg).toHaveAttribute('aria-hidden')
  })

  it('gives each severity a distinct default glyph', () => {
    const shapes = new Set<string>()
    for (const severity of ['info', 'success', 'warning', 'danger'] as const) {
      const view = render(<InformBanner body="Body" severity={severity} />)
      const svg = view.container.querySelector('[data-slot="inform-icon"] svg')
      shapes.add(svg?.innerHTML ?? '')
      view.unmount()
    }

    expect(shapes.size).toBe(4)
  })

  /*
   * Both gutters are one line tall. That is what puts them on the first line's
   * optical centre under `items-start`, with no per-slot offset to go stale.
   */
  it('sizes both gutter slots to one line of text', () => {
    render(<InformBanner body="Body" dismissable />)

    const banner = screen.getByRole('status')
    const slot = banner.querySelector('[data-slot="inform-icon"]')
    const button = banner.querySelector('button')

    expect(slot).toHaveClass(SLOT_SIZE_CLASS)
    expect(button).toHaveClass(SLOT_SIZE_CLASS)
    // 1lh resolves against the slot, so the slot class carries its own line-height.
    expect(declarations(`.${SLOT_SIZE_CLASS}`)).toMatchObject({
      'inline-size': '1lh',
      'block-size': '1lh',
      'line-height': '1.375',
    })
  })

  it('needs no per-slot offset to align the gutters', () => {
    render(<InformBanner body="Body" dismissable />)

    const banner = screen.getByRole('status')
    const slot = banner.querySelector<HTMLElement>('[data-slot="inform-icon"]')
    expect(slot?.style.marginBlockStart).toBe('')
    expect(banner.querySelector('button')?.getAttribute('style')).toBeNull()
  })

  /*
   * A one-line-tall control still owes WCAG 2.2 (2.5.8) a 24px target, so it
   * expands invisibly rather than growing its box and breaking the alignment.
   */
  it('keeps a 24px touch target without growing the control box', () => {
    render(<InformBanner body="Body" dismissable />)

    const button = screen.getByRole('button', { name: 'Dismiss' })
    expect(button).toHaveClass('a63-InformDismissButton')
    const target = declarations('.a63-InformDismissButton::after')
    expect(target.position).toBe('absolute')
    expect(target.inset).toContain('1.5rem')
  })

  /*
   * Wrapping does not change the rule: the gutters stay on the first line
   * whatever the message height. jsdom cannot wrap text, so this pins the
   * mechanism; the pixels are measured in a real browser.
   */
  it('keeps its gutters on the first line for a multi-line message', () => {
    render(
      <InformBanner
        body="A message long enough that it would wrap onto several lines in a real layout."
        dismissable
        title="Heads up"
      />
    )

    const banner = screen.getByRole('status')
    expect(banner).toHaveClass('a63-InformBanner')
    expect(banner.querySelector('[data-slot="inform-icon"]')).toHaveClass(SLOT_SIZE_CLASS)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <InformBanner body="Body" />
        <InformBanner
          actions={[{ id: 'read', label: 'Read more', onSelect: () => undefined }]}
          body="Body"
          dismissable
          severity="warning"
          title="Heads up"
        />
      </div>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
