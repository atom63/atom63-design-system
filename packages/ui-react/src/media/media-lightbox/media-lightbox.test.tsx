import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  {
    alt: 'Ribbon wallpaper',
    darkSrc: '/ribbon-dark.webp',
    id: 'ribbon',
    lightSrc: '/ribbon-light.webp',
    title: 'Ribbon',
  },
  {
    alt: 'Curvy wallpaper',
    href: 'https://example.com/curvy',
    id: 'curvy',
    src: '/curvy.webp',
    title: 'Curvy',
  },
  {
    alt: 'WIP11 wallpaper',
    href: '/projects/wip11',
    id: 'wip11',
    src: '/wip11.webp',
    title: 'WIP11',
  },
]

async function flushZoomFrame() {
  await act(async () => {
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

function renderLightbox(overrides: Partial<React.ComponentProps<typeof MediaLightbox>> = {}) {
  const onIndexChange = vi.fn()
  const onOpenChange = vi.fn()
  const onAppearanceChange = vi.fn()

  const result = render(
    <MediaLightbox
      appearance={{ ribbon: 'dark' }}
      index={0}
      items={items}
      onAppearanceChange={onAppearanceChange}
      onIndexChange={onIndexChange}
      onOpenChange={onOpenChange}
      open
      {...overrides}
    />
  )

  return { onAppearanceChange, onIndexChange, onOpenChange, ...result }
}

describe('MediaLightbox', () => {
  it('renders nothing while closed', () => {
    renderLightbox({ open: false })

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('presents the active item as a modal labelled by its title', () => {
    renderLightbox({ index: 1 })

    // The name carries the position so a screen reader announces where in the
    // gallery the viewer is, not just what it is looking at.
    const dialog = screen.getByRole('dialog', { name: 'Curvy — 2 of 3' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByAltText('Curvy wallpaper')).toHaveAttribute('src', '/curvy.webp')
    expect(screen.getByAltText('Curvy wallpaper')).toHaveAttribute('sizes', 'min(92vw, 1400px)')
  })

  it('dims with an opaque backdrop so the page behind can stop painting', () => {
    renderLightbox({ index: 0 })

    const backdrop = document.querySelector('[data-slot="media-lightbox-backdrop"]')
    // The backdrop follows the theme surface token instead of a hardcoded
    // black — the lightbox can now go light or dark with the rest of the app.
    expect(backdrop?.className ?? '').toMatch(/a63-surface-page/)
    expect(backdrop?.className ?? '').not.toMatch(/backdrop-blur/)
  })

  it('lays every item out as its own stacked slide, reachable only when active', () => {
    renderLightbox({ index: 1 })

    // The lightbox is portalled, so it is never inside the render container.
    const slides = document.querySelectorAll('[data-slot="media-lightbox-slide"]')
    expect(slides).toHaveLength(items.length)
    expect(document.querySelector('[data-slot="media-lightbox-track"]')).not.toBeNull()

    // Only the item on screen is reachable; the rest sit `inert` in the stack.
    expect(slides[1]).not.toHaveAttribute('inert')
    expect(slides[0]).toHaveAttribute('inert')
  })

  it('announces where in the gallery the viewer is', () => {
    renderLightbox({ index: 1 })

    const status = document.querySelector('[data-slot="media-lightbox-status"]')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('Curvy, 2 of 3')
  })

  it('jumps to the ends of the gallery with Home and End', async () => {
    const user = userEvent.setup()
    const { onIndexChange } = renderLightbox({ index: 1 })

    await user.keyboard('{End}')
    expect(onIndexChange).toHaveBeenCalledWith(items.length - 1)

    await user.keyboard('{Home}')
    expect(onIndexChange).toHaveBeenCalledWith(0)
  })

  it('shows the light source when the caller selects the light appearance', () => {
    renderLightbox({ appearance: { ribbon: 'light' } })

    expect(screen.getByAltText('Ribbon wallpaper')).toHaveAttribute('src', '/ribbon-light.webp')
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderLightbox()

    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('moves through the gallery with the arrow keys', async () => {
    const user = userEvent.setup()
    const { onIndexChange } = renderLightbox({ index: 1 })

    await user.keyboard('{ArrowRight}')
    expect(onIndexChange).toHaveBeenCalledWith(2)

    await user.keyboard('{ArrowLeft}')
    expect(onIndexChange).toHaveBeenCalledWith(0)
  })

  it('offers the variant toggle only for items with light and dark sources', async () => {
    const user = userEvent.setup()
    const { onAppearanceChange, rerender } = renderLightbox()

    await user.click(screen.getByRole('button', { name: 'Show light version of Ribbon' }))
    expect(onAppearanceChange).toHaveBeenCalledWith('ribbon', 'light')

    rerender(
      <MediaLightbox
        appearance={{}}
        index={1}
        items={items}
        onAppearanceChange={onAppearanceChange}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      />
    )
    expect(screen.queryByRole('button', { name: /version of/ })).toBeNull()
  })

  it('closes on a sustained pull and leaves a short one alone', () => {
    // Only the pull gesture settles on a timer; the rest of the suite is real.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { onOpenChange } = renderLightbox()
    const track = document.querySelector('[data-slot="media-lightbox-track"]')
    expect(track).not.toBeNull()

    const pull = (deltaY: number) => {
      track?.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY }))
    }

    // Negative deltaY is a two-finger drag *down* — the dismiss direction.
    pull(-40)
    vi.advanceTimersByTime(300)
    expect(onOpenChange).not.toHaveBeenCalled()

    pull(-200)
    vi.advanceTimersByTime(300)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    vi.useRealTimers()
  })

  /**
   * A trackpad keeps emitting `wheel` events for up to a second after the
   * fingers lift. Treating that coast as input made the photo drift on after
   * the hand had stopped, and made the decision wait for the coast to end.
   */
  it('decides a trackpad pull on the hand, not on the coast that follows it', () => {
    const { onOpenChange } = renderLightbox()
    const track = document.querySelector('[data-slot="media-lightbox-track"]')
    const stage = track?.parentElement
    expect(stage).not.toBeNull()

    // Timestamps are supplied rather than read off the clock. Momentum is
    // recognised partly by its cadence, so on a host busy enough to put more
    // than a frame between two synthetic events the coast reads as a fresh
    // push — a fact about the machine, not about the gesture.
    let time = 0
    const wheel = (deltaY: number, gap: number) => {
      const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY })
      Object.defineProperty(event, 'timeStamp', { value: time })
      time += gap
      track?.dispatchEvent(event)
    }

    // An unhurried pull, well short of the dismiss distance and slow enough
    // that it is not a flick either.
    for (const delta of [-3, -5, -7, -8]) {
      wheel(delta, 100)
    }
    expect(onOpenChange).not.toHaveBeenCalled()
    const underTheHand = stage?.style.transform
    expect(underTheHand).not.toBe('')

    // Fingers up. The browser coasts at frame rate, decaying, and there is far
    // more of it than the part the user drove.
    for (const delta of [-7, -5, -4, -3, -2, -2, -1]) {
      wheel(delta, 16)
    }

    // Once the coast is recognised the media stops taking it, and a gesture the
    // user ended gently closes nothing.
    expect(stage?.style.transform).not.toBe(underTheHand)
    expect(onOpenChange).not.toHaveBeenCalled()

    const parked = stage?.style.transform
    for (const delta of [-1, -1, -1]) {
      wheel(delta, 16)
    }
    expect(stage?.style.transform).toBe(parked)
  })

  it('commits a trackpad pull the moment it crosses the threshold', () => {
    const { onOpenChange } = renderLightbox()
    const track = document.querySelector('[data-slot="media-lightbox-track"]')

    let time = 0
    const pull = (deltaY: number) => {
      const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY })
      Object.defineProperty(event, 'timeStamp', { value: time })
      time += 16
      track?.dispatchEvent(event)
    }

    pull(-60)
    pull(-60)

    // No timers advanced: past the threshold the answer cannot change, so
    // waiting for the wheel to go quiet only delays the close behind the coast.
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on a mouse drag down and leaves a short one alone', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { onOpenChange } = renderLightbox()
    const track = document.querySelector('[data-slot="media-lightbox-track"]')
    expect(track).not.toBeNull()

    const drag = (deltaY: number) => {
      const down = new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientX: 200,
        clientY: 200,
        pointerId: 1,
        pointerType: 'mouse',
      })
      const move = new PointerEvent('pointermove', {
        bubbles: true,
        cancelable: true,
        clientX: 200,
        clientY: 200 + deltaY,
        pointerId: 1,
        pointerType: 'mouse',
      })
      const up = new PointerEvent('pointerup', {
        bubbles: true,
        clientX: 200,
        clientY: 200 + deltaY,
        pointerId: 1,
        pointerType: 'mouse',
      })
      Object.defineProperty(down, 'timeStamp', { value: 1_000 })
      Object.defineProperty(move, 'timeStamp', { value: 1_250 })
      Object.defineProperty(up, 'timeStamp', { value: 1_250 })
      track?.dispatchEvent(down)
      window.dispatchEvent(move)
      window.dispatchEvent(up)
    }

    drag(40)
    expect(onOpenChange).not.toHaveBeenCalled()

    drag(200)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    vi.useRealTimers()
  })

  it('dismisses upward as readily as downward', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { onOpenChange } = renderLightbox()
    const track = document.querySelector('[data-slot="media-lightbox-track"]')

    const drag = (deltaY: number) => {
      const at = (type: string, y: number, time: number) => {
        const event = new PointerEvent(type, {
          bubbles: true,
          button: 0,
          cancelable: true,
          clientX: 200,
          clientY: y,
          pointerId: 1,
          pointerType: 'mouse',
        })
        Object.defineProperty(event, 'timeStamp', { value: time })
        return event
      }
      track?.dispatchEvent(at('pointerdown', 400, 1_000))
      window.dispatchEvent(at('pointermove', 400 + deltaY, 1_250))
      window.dispatchEvent(at('pointerup', 400 + deltaY, 1_250))
    }

    // Up used to be damped to a third, so it could not reach the threshold at
    // all — a gesture the interface accepted and then ignored.
    drag(-40)
    expect(onOpenChange).not.toHaveBeenCalled()

    drag(-200)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    vi.useRealTimers()
  })

  it('dismisses an upward trackpad pull', () => {
    const { onOpenChange } = renderLightbox()
    const track = document.querySelector('[data-slot="media-lightbox-track"]')

    // Positive deltaY is a two-finger drag *up*.
    for (const delta of [40, 60, 60]) {
      track?.dispatchEvent(
        new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: delta })
      )
    }

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('leaves sideways wheel gestures to the gallery', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { onOpenChange } = renderLightbox()
    const track = document.querySelector('[data-slot="media-lightbox-track"]')

    track?.dispatchEvent(
      new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX: -400, deltaY: -10 })
    )
    vi.advanceTimersByTime(300)

    expect(onOpenChange).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('zooms on ctrl + wheel and stands the gallery gestures down', async () => {
    const user = userEvent.setup()
    const { onIndexChange } = renderLightbox({ index: 1 })
    const track = document.querySelector('[data-slot="media-lightbox-track"]')
    const dialog = screen.getByRole('dialog')

    // A trackpad pinch arrives as ctrl + wheel.
    act(() => {
      track?.dispatchEvent(
        new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -200 })
      )
    })
    await flushZoomFrame()

    expect(dialog).toHaveAttribute('data-zoomed', 'true')

    // Turning the page would throw away the zoom mid-gesture.
    await user.keyboard('{ArrowRight}')
    expect(onIndexChange).not.toHaveBeenCalled()
  })

  it('rebinds the zoom to whichever slide is on screen', async () => {
    const { rerender } = renderLightbox({ index: 0 })
    const track = document.querySelector('[data-slot="media-lightbox-track"]')

    act(() => {
      track?.dispatchEvent(
        new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -200 })
      )
    })
    await flushZoomFrame()
    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'true')

    rerender(
      <MediaLightbox index={1} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )

    // The zoom belonged to the previous slide, and its layer is no longer the
    // one under the pointer.
    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'false')
    for (const layer of document.querySelectorAll<HTMLElement>(
      '[data-slot="media-lightbox-zoom"]'
    )) {
      expect(layer.style.transform).not.toContain('scale(2')
    }
  })

  it('leaves a plain wheel to the dismiss gesture rather than zooming', () => {
    renderLightbox()
    const track = document.querySelector('[data-slot="media-lightbox-track"]')

    act(() => {
      track?.dispatchEvent(
        new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -20 })
      )
    })

    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'false')
  })

  it('zooms in and out from separate chrome controls', async () => {
    const user = userEvent.setup()
    renderLightbox()
    const dialog = screen.getByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Zoom into Ribbon' }))
    await waitFor(() => {
      expect(dialog).toHaveAttribute('data-zoomed', 'true')
    })

    await user.click(screen.getByRole('button', { name: 'Zoom out of Ribbon' }))
    await waitFor(() => {
      expect(dialog).toHaveAttribute('data-zoomed', 'false')
    })
  })

  it('unwinds the zoom before it closes, so Escape gives back the picture first', async () => {
    // A viewer who has zoomed in almost never means "throw the gallery away"
    // by the time they reach for Escape — they mean "get me back to the whole
    // picture". Closing outright costs them their place in the gallery as
    // well as the zoom, and `0` is the only other way back to fit with
    // nothing in the chrome advertising it.
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderLightbox({ onOpenChange })
    const dialog = screen.getByRole('dialog')

    await user.keyboard('{+}')
    expect(dialog).toHaveAttribute('data-zoomed', 'true')

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(dialog).toHaveAttribute('data-zoomed', 'false')
    })
    expect(onOpenChange).not.toHaveBeenCalled()

    // Still one key from leaving, once the picture is whole again.
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('zooms with unmodified keys and leaves the browser its page zoom', async () => {
    const user = userEvent.setup()
    renderLightbox()
    const dialog = screen.getByRole('dialog')

    await user.keyboard('{+}')
    expect(dialog).toHaveAttribute('data-zoomed', 'true')

    await user.keyboard('0')
    await waitFor(() => {
      expect(dialog).toHaveAttribute('data-zoomed', 'false')
    })

    // WCAG 1.4.4: page zoom has to keep working while the dialog is open.
    await user.keyboard('{Meta>}{+}{/Meta}')
    expect(dialog).toHaveAttribute('data-zoomed', 'false')
  })

  it("speaks the caller's copy rather than shipping English", () => {
    renderLightbox({
      labels: {
        carousel: 'lunbo',
        close: 'guanbi',
        position: (index, total) => `di ${index + 1} / gong ${total}`,
      },
    })

    expect(screen.getByRole('button', { name: 'guanbi' })).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Ribbon — di 1 / gong 3' })).toBeInTheDocument()
  })

  it('mounts media only around the active slide', () => {
    renderLightbox({ index: 0, preload: 0 })

    // Every slide keeps its box in the stack; only the bitmaps are gated.
    expect(document.querySelectorAll('[data-slot="media-lightbox-slide"]')).toHaveLength(
      items.length
    )
    expect(document.querySelectorAll('[data-slot="media-lightbox-image"]')).toHaveLength(1)
  })

  it('renders no image for an item with no resolvable source', () => {
    renderLightbox({
      index: 0,
      items: [{ alt: 'Sourceless', id: 'sourceless', title: 'Sourceless' }],
    })

    expect(document.querySelectorAll('[data-slot="media-lightbox-image"]')).toHaveLength(0)
    expect(screen.getByRole('dialog', { name: 'Sourceless — 1 of 1' })).toBeInTheDocument()
  })

  it('presents a video item with its own controls', () => {
    renderLightbox({
      index: 0,
      items: [
        {
          alt: 'A reel',
          id: 'reel',
          kind: 'video',
          poster: '/reel.jpg',
          sources: [{ src: '/reel.mp4', type: 'video/mp4' }],
          title: 'Reel',
        },
      ],
    })

    const video = document.querySelector('[data-slot="media-lightbox-video"]')
    expect(video).not.toBeNull()
    expect(video).toHaveAttribute('poster', '/reel.jpg')
    // The gallery's drag and pull gestures stand down over a video's controls.
    expect(video).toHaveAttribute('data-a63-no-drag')
  })

  it('renders arbitrary content when an item brings its own', () => {
    renderLightbox({
      index: 0,
      items: [{ alt: 'Embed', id: 'embed', render: <p>A 3D viewer</p>, title: 'Embed' }],
    })

    expect(screen.getByText('A 3D viewer')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="media-lightbox-image"]')).toBeNull()
  })

  it('shows a caption when the item has one, and nothing when it does not', () => {
    const { rerender } = renderLightbox({ index: 0 })
    expect(document.querySelector('[data-slot="media-lightbox-caption"]')).toBeNull()

    rerender(
      <MediaLightbox
        index={0}
        items={[{ ...items[0], caption: 'Shot on a Tuesday' } as (typeof items)[number]]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      />
    )
    expect(screen.getByText('Shot on a Tuesday')).toBeInTheDocument()
  })

  it('puts what describes the photo below it and what acts on it in one corner', () => {
    renderLightbox({
      index: 0,
      items: items.map((entry, entryIndex) =>
        entryIndex === 0 ? { ...entry, caption: 'Ribbon at dusk' } : entry
      ),
      thumbnails: true,
    })

    // Below the photo: what it is and where you are in the set.
    const dock = document.querySelector('[data-slot="media-lightbox-dock"]')
    expect(dock).toContainElement(document.querySelector('[data-slot="media-lightbox-caption"]'))
    expect(dock).toContainElement(document.querySelector('[data-slot="media-lightbox-thumbnails"]'))

    // Everything that acts on the photo sits together instead, so the viewer
    // has one place to look rather than two.
    const zoomIn = screen.getByRole('button', { name: /zoom in/i })
    expect(dock).not.toContainElement(zoomIn)
    const cluster = screen.getByRole('button', { name: 'Close media viewer' }).parentElement
    expect(cluster).toContainElement(zoomIn)
  })

  it('keeps a visible way to turn the page for people who never swipe', async () => {
    // Swipe, the thumbnail strip and the arrow keys all turn the page, and
    // none of them is visible before you try it: a pointer user arriving at a
    // photograph has nothing telling them there is another one. The chevrons
    // are the only affordance that announces itself, which is why they are
    // pinned here — they were dropped once already without a test noticing.
    const user = userEvent.setup()
    const { onIndexChange } = renderLightbox({ index: 1 })

    const previous = screen.getByRole('button', { name: /previous/i })
    const next = screen.getByRole('button', { name: /next/i })

    // Beside the picture, not gathered into the corner cluster with the
    // controls that act on it — they move through the gallery instead.
    const cluster = screen.getByRole('button', { name: 'Close media viewer' }).parentElement
    expect(cluster).not.toContainElement(previous)
    expect(cluster).not.toContainElement(next)

    await user.click(next)
    expect(onIndexChange).toHaveBeenCalledWith(2)
    await user.click(previous)
    expect(onIndexChange).toHaveBeenCalledWith(0)
  })

  it('wires thumbnails to their slides as tabs and panels', () => {
    renderLightbox({ index: 1, thumbnails: true })

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(items.length)
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    // Roving tabindex: a long gallery must not cost a tab stop per item.
    expect(tabs.map(tab => tab.tabIndex)).toEqual([-1, 0, -1])

    const panel = document.querySelector('[data-slot="media-lightbox-slide"]:not([inert])')
    expect(panel).toHaveAttribute('role', 'tabpanel')
    expect(tabs[1]).toHaveAttribute('aria-controls', panel?.id)
  })

  it('opens external destinations in a new tab', () => {
    renderLightbox({ index: 1 })

    const link = screen.getByRole('link', { name: 'Open Curvy (opens in new tab)' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('lets the caller supply a router element for internal destinations', () => {
    renderLightbox({
      index: 2,
      items: items.map(item =>
        item.id === 'wip11'
          ? {
              ...item,
              renderHref: (
                <a data-router-link="" href={item.href}>
                  <span className="sr-only">Router link</span>
                </a>
              ),
            }
          : item
      ),
    })

    const link = screen.getByRole('link', { name: 'Open WIP11' })
    expect(link).toHaveAttribute('data-router-link')
    expect(link).not.toHaveAttribute('target')
  })

  it('returns focus to the trigger when it closes', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button
            onClick={() => {
              setOpen(true)
            }}
            type="button"
          >
            Open
          </button>
          <MediaLightbox
            index={0}
            items={items}
            onIndexChange={vi.fn()}
            onOpenChange={setOpen}
            open={open}
          />
        </>
      )
    }

    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open' })
    await user.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const restore = vi.spyOn(trigger, 'focus')
    await user.keyboard('{Escape}')
    // AnimatePresence keeps the overlay mounted until the exit animation ends,
    // which is longer than the default wait once the machine is busy.
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).toBeNull()
      },
      { timeout: 4000 }
    )
    expect(trigger).toHaveFocus()
    expect(restore).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('reports when the closing morph has finished', async () => {
    const user = userEvent.setup()
    const onExitComplete = vi.fn()

    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <MediaLightbox
          index={0}
          items={items}
          onExitComplete={onExitComplete}
          onIndexChange={vi.fn()}
          onOpenChange={setOpen}
          open={open}
        />
      )
    }

    render(<Harness />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onExitComplete).not.toHaveBeenCalled()

    await user.keyboard('{Escape}')

    // Not when the close is requested — when the overlay has actually gone. The
    // caller holds its thumbnail still until then.
    await waitFor(
      () => {
        expect(onExitComplete).toHaveBeenCalled()
      },
      { timeout: 4000 }
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  /**
   * The same link is rendered twice on a gallery page — once on the tile, once
   * in the dock — and only one of them was going through the shared indicator.
   * The other hand-picked its icons and drifted: a boxed `open-in-new` beside
   * the tile's bare arrow, and a right arrow where internal reads as an eye.
   */
  it('marks destinations with the shared indicator', () => {
    renderLightbox({
      index: 1,
      items: [
        { alt: 'Away', href: 'https://example.com/away', id: 'away', title: 'Away' },
        { alt: 'Here', href: '/projects/here', id: 'here', title: 'Here' },
      ],
    })

    const indicator = document.querySelector('[data-destination-kind]')
    expect(indicator?.getAttribute('data-destination-kind')).toBe('internal')
  })

  /**
   * "2 of 3" is digits either side of a word. A right-to-left paragraph
   * reorders that run into "of 3 2" — the text node is untouched, so only the
   * rendering is wrong and no DOM assertion can see it, which is how this
   * shipped. `dir="auto"` takes the direction from the text itself.
   */
  it('isolates the counter from the paragraph direction', () => {
    renderLightbox({ index: 1 })

    const counter = document.querySelector('[data-slot="media-lightbox-counter"]')
    expect(counter?.textContent).toBe('2 of 3')
    expect(counter?.getAttribute('dir')).toBe('auto')
  })

  /**
   * The morph measures the media in viewport coordinates. A scrolling track
   * used to have to be parked on the opening slide first, or the measurement
   * landed wherever an interrupted scroll happened to be — every slide in the
   * stack now occupies the same box regardless of which index is active, so
   * that race cannot recur: opening on a slide other than the first measures
   * correctly with no parking step at all.
   */
  it('measures the morph correctly no matter which slide the lightbox opens on', async () => {
    const MEDIA_WIDTH = 800
    const MEDIA_HEIGHT = 600
    const OPEN_INDEX = 2

    const makeRect = (left: number, top: number, width: number, height: number): DOMRect =>
      ({
        bottom: top + height,
        height,
        left,
        right: left + width,
        toJSON: () => ({}),
        top,
        width,
        x: left,
        y: top,
      }) as DOMRect

    const origin = document.createElement('div')
    origin.getBoundingClientRect = () => makeRect(100, 100, 200, 150)
    document.body.append(origin)

    const originalRect = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function (this: HTMLElement) {
      if (this.dataset?.slot !== 'media-lightbox-frame') {
        return originalRect.call(this)
      }
      // Every slide's frame sits in the same box in the stack; there is no
      // per-index offset to account for.
      return makeRect(0, 0, MEDIA_WIDTH, MEDIA_HEIGHT)
    }

    try {
      renderLightbox({ index: OPEN_INDEX, origin })

      const frame = document.querySelector<HTMLElement>(
        '[data-slot="media-lightbox-slide"]:not([inert]) [data-slot="media-lightbox-frame"]'
      )
      expect(frame).not.toBeNull()

      // Media centre (400, 300) onto thumbnail centre (200, 175).
      const x = /translate3d\((-?[\d.]+)px/.exec(frame?.style.transform ?? '')?.[1]
      expect(Number(x)).toBeCloseTo(-200, 1)
    } finally {
      Element.prototype.getBoundingClientRect = originalRect
      origin.remove()
    }
  })
})
