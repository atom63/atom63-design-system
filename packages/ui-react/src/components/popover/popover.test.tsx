import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PortalContainerProvider } from '../portal-container'
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
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
})
