import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

// Motion's frameloop captures `requestAnimationFrame` when it is first
// imported; the fake clock has to be in place before that, for the whole file.
vi.hoisted(() => {
  vi.useFakeTimers()
})

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function open() {
  const onOpenChange = vi.fn()
  render(
    <MediaLightbox
      index={0}
      items={items}
      onIndexChange={vi.fn()}
      onOpenChange={onOpenChange}
      open
    />
  )
  return { onOpenChange }
}

function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function chromeHidden(): boolean {
  const dock = document.querySelector('[data-slot="media-lightbox-dock"]')?.parentElement
    ?.parentElement
  if (!dock) {
    throw new Error('dock missing')
  }
  return dock.className.includes('pointer-events-none')
}

function closeArea(): HTMLElement {
  const area = document.querySelector<HTMLElement>(
    '[data-slot="media-lightbox-slide"][data-active] button[tabindex="-1"][aria-hidden]'
  )
  if (!area) {
    throw new Error('close area missing')
  }
  return area
}

let pointerId = 0

function press(
  type: string,
  target: EventTarget,
  pointerType: 'touch' | 'mouse',
  x = 200,
  y = 100,
  id = pointerId
) {
  act(() => {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        button: 0,
        cancelable: true,
        clientX: x,
        clientY: y,
        isPrimary: true,
        pointerId: id,
        pointerType,
      })
    )
  })
}

/** A finger down and up, and the `click` a browser synthesises from it. */
function tap(target: HTMLElement, pointerType: 'touch' | 'mouse' = 'touch') {
  pointerId += 1
  press('pointerdown', target, pointerType)
  wait(40)
  press('pointerup', window, pointerType)
  act(() => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

afterEach(() => {
  wait(5000)
})

describe('MediaLightbox touch taps', () => {
  it('toggles the chrome on a tap around the photo instead of closing', () => {
    const { onOpenChange } = open()
    expect(chromeHidden()).toBe(false)

    tap(closeArea())
    // Held back for the double-tap window first.
    expect(chromeHidden()).toBe(false)
    wait(300)
    expect(chromeHidden()).toBe(true)

    tap(closeArea())
    wait(300)
    expect(chromeHidden()).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('toggles the chrome on a tap on the photo itself', () => {
    open()

    tap(screen.getByAltText('One'))
    wait(300)

    expect(chromeHidden()).toBe(true)
  })

  it('keeps chrome a tap hid hidden until the next tap', () => {
    open()
    tap(closeArea())
    wait(300)
    expect(chromeHidden()).toBe(true)

    // Time passing, and a finger moving over the photo, reveal nothing.
    wait(10_000)
    pointerId += 1
    press('pointerdown', closeArea(), 'touch')
    press('pointermove', screen.getByRole('dialog'), 'touch', 240)
    press('pointerup', window, 'touch', 240)
    wait(300)

    expect(chromeHidden()).toBe(true)
  })

  it('keeps chrome a tap showed up rather than idling it away', () => {
    open()
    // Idle out first, then bring it back with a tap.
    wait(3000)
    expect(chromeHidden()).toBe(true)

    tap(closeArea())
    wait(300)
    expect(chromeHidden()).toBe(false)

    wait(10_000)
    expect(chromeHidden()).toBe(false)
  })

  it('zooms on a double-tap without also toggling the chrome', () => {
    open()
    const photo = screen.getByAltText('One')

    tap(photo)
    wait(120)
    tap(photo)
    // The browser's own double-tap, which zoom answers.
    act(() => {
      photo.dispatchEvent(
        new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: 200, clientY: 100 })
      )
    })
    wait(500)

    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'true')
    expect(chromeHidden()).toBe(false)
  })

  it('still closes on a mouse click outside the photo', () => {
    const { onOpenChange } = open()

    tap(closeArea(), 'mouse')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows chrome a tap hid as soon as keyboard focus enters it', () => {
    open()
    tap(closeArea())
    wait(300)
    expect(chromeHidden()).toBe(true)

    // A `Tab` from the dialog into a chrome control.
    act(() => {
      screen.getByRole('dialog').focus()
      screen.getByRole('button', { name: /zoom into/i }).focus()
    })

    expect(chromeHidden()).toBe(false)
  })

  it('reveals chrome a tap hid when a mouse moves', () => {
    open()
    tap(closeArea())
    wait(300)
    expect(chromeHidden()).toBe(true)

    press('pointermove', screen.getByRole('dialog'), 'mouse')

    expect(chromeHidden()).toBe(false)
  })
})
