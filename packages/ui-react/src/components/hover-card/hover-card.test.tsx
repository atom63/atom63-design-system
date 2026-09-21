import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PortalContainerProvider } from '../portal-container'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

describe('HoverCard', () => {
  it('renders the trigger, and the popup content when open', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>@atom63</HoverCardTrigger>
        <HoverCardContent>Preview content</HoverCardContent>
      </HoverCard>
    )
    expect(screen.getByText('@atom63')).toBeInTheDocument()
    const content = document.querySelector('[data-slot="hover-card-content"]')
    expect(content).not.toBeNull()
    expect(content).toHaveClass('a63-HoverCard-popup')
  })

  it('defaults side to bottom and sideOffset parity with @atom63/ui', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>@atom63</HoverCardTrigger>
        <HoverCardContent>Preview content</HoverCardContent>
      </HoverCard>
    )
    const positioner = document.querySelector('[data-slot="hover-card-positioner"]')
    expect(positioner).toHaveAttribute('data-side', 'bottom')
  })

  it('portals into PortalContainerProvider when set', async () => {
    const user = userEvent.setup()
    const host = document.createElement('div')
    document.body.append(host)

    render(
      <PortalContainerProvider container={host}>
        <HoverCard>
          <HoverCardTrigger>@atom63</HoverCardTrigger>
          <HoverCardContent>Preview content</HoverCardContent>
        </HoverCard>
      </PortalContainerProvider>
    )

    await user.hover(screen.getByText('@atom63'))
    await waitFor(() => {
      expect(host.querySelector('[data-slot="hover-card-content"]')).not.toBeNull()
    })

    host.remove()
  })
})
