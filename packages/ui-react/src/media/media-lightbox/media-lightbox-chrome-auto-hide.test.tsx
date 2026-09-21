import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function dockElement(): HTMLElement {
  const dock = document.querySelector('[data-slot="media-lightbox-dock"]')?.parentElement
    ?.parentElement
  if (!dock) {
    throw new Error('Expected the dock overlay wrapper to be in the document.')
  }
  return dock as HTMLElement
}

function isHidden(element: HTMLElement): boolean {
  return element.className.includes('pointer-events-none')
}

afterEach(() => {
  vi.useRealTimers()
})

describe('MediaLightbox chrome auto-hide', () => {
  it('is visible on open', () => {
    render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )

    expect(isHidden(dockElement())).toBe(false)
  })

  it('hides after 2.5s idle, leaving no focused control faded out under the user', () => {
    // Opening focuses the dialog itself, not its first control, so the idle
    // clock is free to run: there is no genuinely-focused button for the
    // fade to hide. This pins both halves of that — the hide happening at
    // all (it did not, back when opening focused `Close` and any focus held
    // the chrome up forever), and the reason it is safe to.
    vi.useFakeTimers()
    render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )
    const dialog = screen.getByRole('dialog')
    expect(document.activeElement).toBe(dialog)

    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(isHidden(dockElement())).toBe(true)
    // The thing that just faded is not the thing holding focus.
    expect(document.activeElement).not.toBe(
      screen.getByRole('button', { name: 'Close media viewer' })
    )

    // Hidden means faded and click-through, never removed from the tab
    // order: the close button stays queryable and keyboard-reachable. (Its
    // own visual opacity comes from `Motion`'s open/close mount fade, a
    // separate concern from this idle-hide, and is not asserted here.)
    expect(screen.getByRole('button', { name: 'Close media viewer' })).not.toHaveAttribute(
      'tabindex',
      '-1'
    )
  })

  it('reveals again on pointermove after it has hidden', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(isHidden(dockElement())).toBe(true)

    const dialog = screen.getByRole('dialog')
    act(() => {
      dialog.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }))
    })
    expect(isHidden(dockElement())).toBe(false)
  })

  it('reveals again on any keydown after it has hidden', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(isHidden(dockElement())).toBe(true)

    const dialog = screen.getByRole('dialog')
    act(() => {
      dialog.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Shift' })
      )
    })
    expect(isHidden(dockElement())).toBe(false)
  })

  it('stays visible while a Tab move into the chrome holds it, then idles out once it blurs', () => {
    // This is the keyboard path: opening focuses the dialog, and the first
    // `Tab` moves focus from it into a chrome control. That move reports a
    // `relatedTarget` — the dialog — which is itself inside the lightbox,
    // unlike the open-time focus whose `relatedTarget` is whatever the host
    // page had. So the chrome pins up for as long as a keyboard user is
    // actually on a control, and only idles out once focus leaves.
    vi.useFakeTimers()
    render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )
    expect(document.activeElement).toBe(screen.getByRole('dialog'))

    const zoomIn = screen.getByRole('button', { name: /zoom into/i })
    act(() => {
      zoomIn.focus()
    })
    expect(document.activeElement).toBe(zoomIn)

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    // Focus is still inside the chrome, so the idle clock never wins.
    expect(isHidden(dockElement())).toBe(false)

    act(() => {
      zoomIn.blur()
      vi.advanceTimersByTime(2500)
    })
    expect(isHidden(dockElement())).toBe(true)
  })

  it('never hides while the pointer sits over the dock', () => {
    vi.useFakeTimers()
    render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )

    const dock = dockElement()
    act(() => {
      // React translates `onPointerEnter`/`onPointerLeave` from the bubbling
      // `pointerover`/`pointerout` events it delegates at the root, not from
      // the (non-bubbling) `pointerenter`/`pointerleave` events themselves.
      dock.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }))
      vi.advanceTimersByTime(5000)
    })
    expect(isHidden(dock)).toBe(false)

    act(() => {
      dock.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }))
      vi.advanceTimersByTime(2500)
    })
    expect(isHidden(dock)).toBe(true)
  })

  it('never hides while a drag started in the dock is still in progress', () => {
    vi.useFakeTimers()
    render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )

    const dock = dockElement()
    act(() => {
      dock.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      vi.advanceTimersByTime(5000)
    })
    expect(isHidden(dock)).toBe(false)

    // The drag can end anywhere in the document, not necessarily back inside
    // the dock.
    act(() => {
      document.dispatchEvent(new Event('pointerup'))
      vi.advanceTimersByTime(2500)
    })
    expect(isHidden(dock)).toBe(true)
  })
})
