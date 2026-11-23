import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PortalContainerProvider } from '../portal-container'
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
} from './popover'

function Example() {
  return (
    <Popover defaultOpen>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Filters</PopoverTitle>
          <PopoverDescription>Narrow the results below.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

describe('Popover', () => {
  it('renders the trigger with its slot', () => {
    render(<Example />)
    const trigger = screen.getByText('Open')
    expect(trigger).toHaveClass('a63-Popover-trigger')
    expect(trigger).toHaveAttribute('data-slot', 'popover-trigger')
  })

  it('renders the open popup + its parts', () => {
    render(<Example />)
    const popup = document.querySelector('[data-slot="popover-content"]')
    expect(popup).not.toBeNull()
    expect(popup).toHaveClass('a63-Popover-popup')
    expect(document.querySelector('[data-slot="popover-portal"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="popover-header"]')).not.toBeNull()
    expect(screen.getByText('Filters')).toHaveAttribute('data-slot', 'popover-title')
    expect(screen.getByText('Narrow the results below.')).toHaveAttribute(
      'data-slot',
      'popover-description'
    )
  })

  it('exposes the compatibility anchor and Base UI close slots', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverAnchor data-testid="anchor" />
        <PopoverContent>
          <PopoverClose>Close</PopoverClose>
        </PopoverContent>
      </Popover>
    )
    expect(screen.getByTestId('anchor')).toHaveAttribute('data-slot', 'popover-anchor')
    expect(screen.getByText('Close')).toHaveAttribute('data-slot', 'popover-close')
  })

  it('defaults side to bottom like @atom63/ui', () => {
    render(<Example />)
    const positioner = document.querySelector('[data-slot="popover-positioner"]')
    expect(positioner).toHaveAttribute('data-side', 'bottom')
  })

  it('portals into PortalContainerProvider when set', async () => {
    const user = userEvent.setup()
    const host = document.createElement('div')
    document.body.append(host)

    render(
      <PortalContainerProvider container={host}>
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Hosted</PopoverContent>
        </Popover>
      </PortalContainerProvider>
    )

    await user.click(screen.getByText('Open'))
    await waitFor(() => {
      expect(host.querySelector('[data-slot="popover-content"]')).not.toBeNull()
    })

    host.remove()
  })

  describe('anchoring', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    /* jsdom lays nothing out, so give the anchor a rect far from the trigger's
       (0, 0) and read where the positioner lands: near the anchor, not at the
       trigger. */
    function placeAnchor(element: HTMLElement) {
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 20, width: 40, x: 300, y: 400 })
      )
    }

    async function positionerTop(): Promise<number> {
      const positioner = await waitFor(() => {
        const element = document.querySelector<HTMLElement>('[data-slot="popover-positioner"]')
        if (!element) throw new Error('no positioner')
        return element
      })
      return waitFor(() => {
        const match = /translate\(\s*[-\d.]+px,\s*([-\d.]+)px\)/.exec(positioner.style.transform)
        const top = match ? Number(match[1]) : Number.parseFloat(positioner.style.top)
        if (!(top > 0)) throw new Error(`not positioned yet: ${positioner.getAttribute('style')}`)
        return top
      })
    }

    it('positions against a PopoverAnchor instead of the trigger', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverAnchor
            ref={element => {
              if (element) placeAnchor(element)
            }}
          />
          <PopoverContent sideOffset={8}>Anchored</PopoverContent>
        </Popover>
      )
      expect(await positionerTop()).toBeGreaterThan(300)
    })

    it('positions against an explicit anchor element', async () => {
      const anchor = document.createElement('div')
      document.body.append(anchor)
      placeAnchor(anchor)

      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent anchor={anchor} sideOffset={8}>
            Anchored
          </PopoverContent>
        </Popover>
      )
      expect(await positionerTop()).toBeGreaterThan(300)
      anchor.remove()
    })
  })

  it('PopoverPortal falls back to PortalContainerProvider', () => {
    const host = document.createElement('div')
    document.body.append(host)

    render(
      <PortalContainerProvider container={host}>
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverPortal>
            <span>In portal</span>
          </PopoverPortal>
        </Popover>
      </PortalContainerProvider>
    )

    expect(host).toHaveTextContent('In portal')
    host.remove()
  })

  /* The non-modal dialog outcomes: focus moves into the popup, focus is not
     trapped, Escape closes and returns focus to the trigger, and a press outside
     closes it. */
  describe('keyboard and dismissal', () => {
    function Dismissable() {
      return (
        <>
          <Popover>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Share link</PopoverTitle>
              <PopoverClose>Done</PopoverClose>
            </PopoverContent>
          </Popover>
          <button type="button">Outside</button>
        </>
      )
    }

    it('moves focus in on open, and Escape closes and returns focus to the trigger', async () => {
      const user = userEvent.setup()
      render(<Dismissable />)
      const trigger = screen.getByRole('button', { name: 'Open' })

      await user.click(trigger)
      const popup = await screen.findByRole('dialog')
      await waitFor(() => expect(popup).toContainElement(document.activeElement as HTMLElement))

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(trigger).toHaveFocus()
    })

    it('does not trap focus', async () => {
      const user = userEvent.setup()
      render(<Dismissable />)

      await user.click(screen.getByRole('button', { name: 'Open' }))
      await screen.findByRole('dialog')
      // A trapping dialog would cycle focus between Done and its own edges.
      for (let stop = 0; stop < 3; stop += 1) await user.tab()
      const popup = document.querySelector('[data-slot="popover-content"]')
      expect(popup?.contains(document.activeElement) ?? false).toBe(false)
    })

    it('closes on a press outside', async () => {
      const user = userEvent.setup()
      render(<Dismissable />)

      await user.click(screen.getByRole('button', { name: 'Open' }))
      await screen.findByRole('dialog')
      await user.click(screen.getByRole('button', { name: 'Outside' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    })
  })
})
