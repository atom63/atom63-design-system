import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { declarations } from '../test/css'
import { SLOT_SIZE_CLASS } from './control-slot'
import { InformCornerFlyout } from './inform-corner-flyout'

describe('InformCornerFlyout', () => {
  it('renders nothing when closed', () => {
    render(<InformCornerFlyout body="Body" open={false} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders a polite status region when open', () => {
    render(<InformCornerFlyout body="A new case study is up." open />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('A new case study is up.')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('does not steal focus when it opens', () => {
    render(<InformCornerFlyout body="Body" dismissable open />)

    expect(document.body).toHaveFocus()
  })

  /*
   * The card animates out before reporting the dismissal: reporting it first
   * would drop the message from the store and unmount the card mid-animation,
   * leaving nothing to animate.
   */
  it('animates out before reporting the dismissal', async () => {
    const onDismiss = vi.fn()
    render(<InformCornerFlyout body="Body" dismissable onDismiss={onDismiss} open />)

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(screen.getByRole('status')).toHaveAttribute('data-leaving')
    expect(onDismiss).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  it('ignores a second dismiss while it is already leaving', async () => {
    const onDismiss = vi.fn()
    render(<InformCornerFlyout body="Body" dismissable onDismiss={onDismiss} open />)

    const button = screen.getByRole('button', { name: 'Dismiss' })
    await userEvent.click(button)
    await userEvent.click(button)

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  it('dismisses immediately when motion is reduced', async () => {
    const onDismiss = vi.fn()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }))

    render(<InformCornerFlyout body="Body" dismissable onDismiss={onDismiss} open />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).not.toHaveAttribute('data-leaving')
    vi.unstubAllGlobals()
  })

  it('renders no dismiss control when dismissal is disabled', () => {
    render(<InformCornerFlyout body="Body" dismissable={false} open />)

    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it('leaves placement to the stack that holds it', () => {
    render(<InformCornerFlyout body="Body" open />)

    // Several cards share one anchor point, so a card that positioned itself
    // could not reflow with its siblings.
    expect(screen.getByRole('status')).toHaveClass('a63-InformCornerFlyout')
    expect(declarations('.a63-InformCornerFlyout').position).toBeUndefined()
  })

  it('anchors its leading icon to the first line, like its dismiss control', () => {
    render(<InformCornerFlyout body="Body" open title="Title" />)

    const slot = screen.getByRole('status').querySelector<HTMLElement>('[data-slot="inform-icon"]')
    expect(slot).toHaveClass(SLOT_SIZE_CLASS)
    expect(slot?.style.marginBlockStart).toBe('')
  })

  it('renders media as a bounded thumbnail', () => {
    render(<InformCornerFlyout body="Body" media={<img alt="" src="x.png" />} open title="T" />)

    const thumb = screen.getByRole('status').querySelector('[data-slot="inform-thumbnail"]')
    expect(thumb).not.toBeNull()
    // Fixed footprint: the card's height feeds the stack's offsets, and three
    // cards have to fit a phone.
    expect(thumb).toHaveClass('a63-InformThumbnail')
    const box = declarations('.a63-InformThumbnail')
    expect(box['inline-size']).toBeDefined()
    expect(box['block-size']).toBe(box['inline-size'])
  })

  /*
   * Both are the leading visual, so a card carrying a thumbnail AND a severity
   * glyph would read as two competing subjects.
   */
  it('lets media stand in for the icon rather than joining it', () => {
    render(<InformCornerFlyout body="Body" media={<img alt="" src="x.png" />} open title="T" />)

    const card = screen.getByRole('status')
    expect(card.querySelector('[data-slot="inform-thumbnail"]')).not.toBeNull()
    expect(card.querySelector('[data-slot="inform-icon"]')).toBeNull()
  })

  /*
   * The flyout is a tall card laid out with items-start, so its control must
   * anchor to the first line rather than the middle of the whole block.
   */
  it('aligns its dismiss control to the first line of the card', () => {
    render(<InformCornerFlyout body="Body" dismissable open title="Title" />)

    const button = screen.getByRole('button', { name: 'Dismiss' })
    expect(button).toHaveClass(SLOT_SIZE_CLASS)
  })

  // Ablation A10: without the entrance state the card paints at its final
  // position, so the transition has nothing to animate from.
  it('settles into its entered position after opening', async () => {
    render(<InformCornerFlyout body="Body" open />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('data-state', 'entering')
    await waitFor(() => {
      expect(status).toHaveAttribute('data-state', 'entered')
    })
    expect(declarations(".a63-InformCornerFlyout[data-state='entered']")).toMatchObject({
      opacity: '1',
      transform: 'translateY(0)',
    })
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <InformCornerFlyout
        actions={[{ id: 'read', label: 'Read it', onSelect: () => undefined, variant: 'primary' }]}
        body="Body"
        open
        title="New case study"
      />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
