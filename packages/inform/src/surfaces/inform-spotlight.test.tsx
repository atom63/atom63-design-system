import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { InformSpotlight } from './inform-spotlight'

type Rect = { top: number; left: number; width: number; height: number }

function setAnchorRect(element: HTMLElement, rect: Rect): void {
  element.getBoundingClientRect = () =>
    ({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    }) as DOMRect
}

function mountAnchor(): HTMLButtonElement {
  const anchor = document.createElement('button')
  anchor.type = 'button'
  anchor.id = 'target'
  anchor.textContent = 'Target'
  setAnchorRect(anchor, { top: 100, left: 50, width: 200, height: 40 })
  document.body.append(anchor)
  return anchor
}

afterEach(() => {
  document.getElementById('target')?.remove()
})

describe('InformSpotlight', () => {
  it('renders nothing when closed', () => {
    mountAnchor()
    render(<InformSpotlight anchor="#target" body="Body" open={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders nothing when the anchor is missing', () => {
    render(<InformSpotlight anchor="#absent" body="Body" open />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a modal bubble anchored to the target', async () => {
    mountAnchor()
    render(<InformSpotlight anchor="#target" body="Try the command menu." open title="Tip" />)

    const bubble = await screen.findByRole('dialog')
    expect(bubble).toHaveAttribute('aria-modal', 'true')
    expect(bubble).toHaveTextContent('Try the command menu.')
  })

  it('moves focus into the bubble and restores it on close', async () => {
    const trigger = document.createElement('button')
    trigger.type = 'button'
    document.body.append(trigger)
    trigger.focus()

    mountAnchor()
    const view = render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    const bubble = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(bubble).toHaveFocus()
    })

    view.rerender(<InformSpotlight anchor="#target" body="Body" open={false} title="Tip" />)

    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
    trigger.remove()
  })

  /*
   * The icon is a sibling of the text block, never a child of the title.
   * Nesting it inside the title indents only that line, which leaves the body
   * aligned with the icon rather than with the words directly above it.
   */
  it('puts the icon beside the text block, not inside the title', async () => {
    mountAnchor()
    render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    await screen.findByRole('dialog')
    const slot = screen.getByRole('dialog').querySelector('[data-slot="inform-icon"]')

    expect(slot).not.toBeNull()
    expect(slot?.closest('p')).toBeNull()
    expect(slot?.nextElementSibling).toHaveClass('a63-Inform-content')
  })

  it('dismisses on Escape', async () => {
    mountAnchor()
    const onDismiss = vi.fn()
    render(<InformSpotlight anchor="#target" body="Body" onDismiss={onDismiss} open title="Tip" />)

    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('locks page scroll while open and releases it on close', async () => {
    mountAnchor()
    const view = render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    await screen.findByRole('dialog')
    expect(document.body.style.overflow).toBe('hidden')

    view.rerender(<InformSpotlight anchor="#target" body="Body" open={false} title="Tip" />)

    expect(document.body.style.overflow).not.toBe('hidden')
  })

  /*
   * aria-modal alone is not enough: several assistive technologies still let a
   * virtual cursor walk the background. Marking the siblings inert is what
   * actually takes them out of the accessibility tree.
   */
  it('marks background siblings inert while open, and restores them on close', async () => {
    const background = document.createElement('div')
    background.dataset.testid = 'background'
    background.innerHTML = '<a href="#somewhere">A background link</a>'
    document.body.append(background)

    mountAnchor()
    const view = render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    const bubble = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(background).toHaveAttribute('inert')
    })
    // The spotlight's own subtree must stay reachable.
    expect(bubble.closest('[inert]')).toBeNull()

    view.rerender(<InformSpotlight anchor="#target" body="Body" open={false} title="Tip" />)

    await waitFor(() => {
      expect(background).not.toHaveAttribute('inert')
    })
    background.remove()
  })

  it('leaves already-inert background content inert after closing', async () => {
    const background = document.createElement('div')
    background.setAttribute('inert', '')
    document.body.append(background)

    mountAnchor()
    const view = render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)
    await screen.findByRole('dialog')

    view.rerender(<InformSpotlight anchor="#target" body="Body" open={false} title="Tip" />)

    await waitFor(() => {
      expect(background).toHaveAttribute('inert')
    })
    background.remove()
  })

  /*
   * Production topology: the spotlight is rendered deep inside the app root,
   * not next to <body>. A naive "inert every body child except my own" walk
   * skips the whole app root and therefore inerts nothing at all. This mounts
   * the page content as a sibling *inside* that root, which is where real
   * background content lives.
   */
  it('inerts app content that shares an ancestor with the spotlight', async () => {
    const appRoot = document.createElement('div')
    const pageContent = document.createElement('div')
    pageContent.innerHTML = '<a href="#somewhere">A background link</a>'
    const spotlightHost = document.createElement('div')
    appRoot.append(pageContent, spotlightHost)
    document.body.append(appRoot)

    mountAnchor()
    render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />, {
      container: spotlightHost,
    })

    await screen.findByRole('dialog')
    await waitFor(() => {
      // `inert` applies to the whole subtree, so the attribute lands on the
      // app root rather than on each descendant.
      expect(pageContent.closest('[inert]')).not.toBeNull()
    })

    appRoot.remove()
  })

  it('positions the cutout over the anchor rect', async () => {
    mountAnchor()
    render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    const cutout = await screen.findByTestId('inform-spotlight-cutout')
    expect(cutout).toHaveStyle({ top: '100px', left: '50px', width: '200px', height: '40px' })
  })

  // Ablation A9: without the zero-area guard this cuts a 0x0 hole over a hidden
  // element instead of skipping the message.
  it('renders nothing when the anchor has no area', () => {
    const anchor = mountAnchor()
    setAnchorRect(anchor, { top: 100, left: 50, width: 0, height: 0 })

    render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // Ablation A11: without scroll tracking the cutout stays where the anchor used
  // to be the moment the page moves.
  it('follows the anchor when the page scrolls', async () => {
    const anchor = mountAnchor()
    render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    const cutout = await screen.findByTestId('inform-spotlight-cutout')
    expect(cutout).toHaveStyle({ top: '100px' })

    setAnchorRect(anchor, { top: 20, left: 50, width: 200, height: 40 })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(cutout).toHaveStyle({ top: '20px' })
    })
  })

  it('follows the anchor when the viewport resizes', async () => {
    const anchor = mountAnchor()
    render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    const cutout = await screen.findByTestId('inform-spotlight-cutout')

    setAnchorRect(anchor, { top: 100, left: 10, width: 120, height: 40 })
    fireEvent(window, new Event('resize'))

    await waitFor(() => {
      expect(cutout).toHaveStyle({ left: '10px', width: '120px' })
    })
  })

  // jsdom has no layout engine, so the flip/clamp arithmetic is covered by
  // place-bubble.test.ts. This asserts only that the component is wired to it:
  // a measured bubble with no room below must come out on the top side.
  it('flips the bubble above an anchor near the bottom of the viewport', async () => {
    const anchor = mountAnchor()
    setAnchorRect(anchor, { top: 700, left: 50, width: 200, height: 40 })

    render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    const bubble = await screen.findByRole('dialog')
    expect(bubble).toHaveAttribute('data-side', 'bottom')

    setAnchorRect(bubble, { top: 0, left: 0, width: 320, height: 200 })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(bubble).toHaveAttribute('data-side', 'top')
    })
    expect(Number.parseFloat(bubble.style.top)).toBeLessThan(700)
  })

  it('keeps the bubble inside the viewport when the anchor hugs the right edge', async () => {
    const anchor = mountAnchor()
    setAnchorRect(anchor, { top: 100, left: 1000, width: 20, height: 20 })

    render(<InformSpotlight anchor="#target" body="Body" open title="Tip" />)

    const bubble = await screen.findByRole('dialog')
    setAnchorRect(bubble, { top: 0, left: 0, width: 320, height: 160 })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(Number.parseFloat(bubble.style.left) + 320).toBeLessThanOrEqual(window.innerWidth)
    })
  })

  it('has no axe violations', async () => {
    mountAnchor()
    render(
      <InformSpotlight
        actions={[{ id: 'ok', label: 'Got it', onSelect: () => undefined, variant: 'primary' }]}
        anchor="#target"
        body="Press the command key and K to jump between pages."
        open
        title="Command menu"
      />
    )

    const bubble = await screen.findByRole('dialog', { name: 'Command menu' })
    expect(bubble).toHaveAccessibleDescription('Press the command key and K to jump between pages.')
    expect(await axe(bubble)).toHaveNoViolations()
  })

  it('names itself from the body when it has no title', async () => {
    mountAnchor()
    render(<InformSpotlight anchor="#target" body="Only a body" open />)

    expect(await screen.findByRole('dialog', { name: 'Only a body' })).toBeInTheDocument()
  })
})
