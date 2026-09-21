import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function renderLightbox() {
  render(
    <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
  )
  return screen.getByRole('dialog')
}

/**
 * Opening focuses the dialog itself rather than its first control, so that a
 * screen reader hears the dialog before anything inside it and so the preset's
 * idle-hide never fades a genuinely focused button out from under someone.
 *
 * That container is deliberately not a tab stop, which puts it outside the
 * wrap logic's "focus is on the first/last control" test — so the very first
 * `Tab` out of it is exactly where a trap is easiest to leak.
 */
describe('MediaLightbox focus trap', () => {
  it('opens with the dialog focused, not its first control', () => {
    const dialog = renderLightbox()

    expect(document.activeElement).toBe(dialog)
    expect(document.activeElement).not.toBe(
      screen.getByRole('button', { name: 'Close media viewer' })
    )
  })

  it('keeps a backwards Tab out of the dialog inside the lightbox', async () => {
    const user = userEvent.setup()
    const dialog = renderLightbox()

    await user.tab({ shift: true })

    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('keeps a forwards Tab out of the dialog inside the lightbox', async () => {
    const user = userEvent.setup()
    const dialog = renderLightbox()

    await user.tab()

    expect(dialog.contains(document.activeElement)).toBe(true)
  })
})
