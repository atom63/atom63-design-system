import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem, MediaLightboxProps } from './types'

// Motion's frameloop captures `requestAnimationFrame` when it is first
// imported; the fake clock has to be in place before that, for the whole file.
vi.hoisted(() => {
  vi.useFakeTimers()
})

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function renderLightbox(props: Partial<MediaLightboxProps> = {}) {
  const onIndexChange = vi.fn()
  const onOpenChange = vi.fn()
  const view = render(
    <MediaLightbox
      actions={(item, index) => (
        <>
          <button type="button">{`Save ${item.title} ${index}`}</button>
          {/* Not a button: only the slot's no-drag marker keeps it out of the gestures. */}
          <span data-testid="chip">{`Chip ${item.title}`}</span>
        </>
      )}
      index={0}
      items={items}
      onIndexChange={onIndexChange}
      onOpenChange={onOpenChange}
      open
      toolbar={item => (
        <button aria-label={`Details for ${item.title}`} type="button">
          i
        </button>
      )}
      {...props}
    />
  )
  return { onIndexChange, onOpenChange, view }
}

function slot(name: 'actions' | 'toolbar'): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-slot="media-lightbox-${name}"]`)
  if (!element) {
    throw new Error(`${name} slot missing`)
  }
  return element
}

function dockHidden(): boolean {
  const dock = document.querySelector('[data-slot="media-lightbox-dock"]')?.parentElement
    ?.parentElement
  if (!dock) {
    throw new Error('dock missing')
  }
  return dock.className.includes('pointer-events-none')
}

function touch(type: string, target: EventTarget, id: number) {
  act(() => {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        button: 0,
        cancelable: true,
        clientX: 200,
        clientY: 100,
        isPrimary: true,
        pointerId: id,
        pointerType: 'touch',
      })
    )
  })
}

afterEach(() => {
  wait(5000)
})

describe('MediaLightbox actions and toolbar slots', () => {
  it('renders both slots for the item on screen and follows the index', () => {
    const { onIndexChange, onOpenChange, view } = renderLightbox()

    expect(screen.getByRole('button', { name: 'Save One 0' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Details for One' })).toBeInTheDocument()
    expect(slot('actions').closest('[data-slot="media-lightbox-dock"]')).not.toBeNull()

    view.rerender(
      <MediaLightbox
        actions={(item, index) => <button type="button">{`Save ${item.title} ${index}`}</button>}
        index={1}
        items={items}
        onIndexChange={onIndexChange}
        onOpenChange={onOpenChange}
        open
        toolbar={item => (
          <button aria-label={`Details for ${item.title}`} type="button">
            i
          </button>
        )}
      />
    )

    expect(screen.getByRole('button', { name: 'Save Two 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Details for Two' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save One 0' })).toBeNull()
  })

  it('renders no slot wrapper when a slot returns null', () => {
    renderLightbox({ actions: () => null, toolbar: () => null })

    expect(document.querySelector('[data-slot="media-lightbox-actions"]')).toBeNull()
    expect(document.querySelector('[data-slot="media-lightbox-toolbar"]')).toBeNull()
  })

  it('never pages, zooms or closes on a click in either slot', () => {
    const { onIndexChange, onOpenChange } = renderLightbox()

    fireEvent.click(screen.getByRole('button', { name: 'Save One 0' }))
    fireEvent.click(screen.getByRole('button', { name: 'Details for One' }))
    fireEvent.doubleClick(screen.getByTestId('chip'))

    expect(onIndexChange).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'false')
  })

  it('does not toggle the chrome on a touch tap inside a slot', () => {
    renderLightbox()

    touch('pointerdown', screen.getByTestId('chip'), 41)
    wait(40)
    touch('pointerup', window, 41)
    wait(400)

    expect(dockHidden()).toBe(false)
  })

  it('fades and goes click-through with the rest of the chrome', () => {
    renderLightbox()
    expect(dockHidden()).toBe(false)

    wait(2500)

    expect(dockHidden()).toBe(true)
    const floating = slot('toolbar').closest<HTMLElement>('[style*="chrome-hidden"]')
    expect(floating?.style.getPropertyValue('--a63-media-lightbox-chrome-hidden')).toBe('1')
    expect(slot('toolbar').parentElement?.className).toContain('pointer-events-none')
  })

  it('keeps slot buttons inside the focus trap', () => {
    renderLightbox()
    const dialog = screen.getByRole('dialog')
    const toolbarButton = screen.getByRole('button', { name: 'Details for One' })
    const actionButton = screen.getByRole('button', { name: 'Save One 0' })

    // The toolbar leads the top cluster, so it is the first stop; the actions
    // row is the last thing in the dock without a strip.
    act(() => {
      actionButton.focus()
    })
    fireEvent.keyDown(document.activeElement ?? dialog, { key: 'Tab' })
    expect(document.activeElement).toBe(toolbarButton)

    fireEvent.keyDown(document.activeElement ?? dialog, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(actionButton)
  })
})
