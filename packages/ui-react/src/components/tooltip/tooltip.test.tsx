import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PortalContainerProvider } from '../portal-container'
import {
  Tooltip,
  TooltipCreateHandle,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

function Example() {
  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipPopup>Helpful hint</TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  )
}

describe('Tooltip', () => {
  it('renders the trigger with its stable slot', () => {
    render(<Example />)
    expect(screen.getByText('Hover me')).toHaveAttribute('data-slot', 'tooltip-trigger')
  })

  it('opens on pointer hover', async () => {
    const user = userEvent.setup()
    render(<Example />)

    await user.hover(screen.getByText('Hover me'))

    await waitFor(() => {
      expect(screen.getByText('Helpful hint')).toBeInTheDocument()
    })
    expect(document.querySelector('[data-slot="tooltip-popup"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="tooltip-viewport"]')).not.toBeNull()
  })

  it('opens on keyboard focus and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<Example />)

    await user.tab()
    expect(await screen.findByText('Helpful hint')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument()
    })
  })

  it('forwards the trigger render prop for polymorphism', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<a href="/docs">Docs</a>} />
          <TooltipPopup>Read the docs</TooltipPopup>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })

  it('uses top placement by default', async () => {
    const user = userEvent.setup()
    render(<Example />)

    await user.hover(screen.getByText('Hover me'))
    const positioner = await waitFor(() =>
      document.querySelector('[data-slot="tooltip-positioner"]')
    )

    expect(positioner).toHaveAttribute('data-side', 'top')
  })

  it('accepts Base UI portal props', async () => {
    const user = userEvent.setup()
    const host = document.createElement('div')
    document.body.append(host)

    render(
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipPopup portalProps={{ container: host }}>Helpful hint</TooltipPopup>
        </Tooltip>
      </TooltipProvider>
    )

    await user.hover(screen.getByText('Hover me'))
    await waitFor(() => {
      expect(host.querySelector('[data-slot="tooltip-popup"]')).not.toBeNull()
    })

    host.remove()
  })

  it('falls back to PortalContainerProvider', async () => {
    const user = userEvent.setup()
    const host = document.createElement('div')
    document.body.append(host)

    render(
      <PortalContainerProvider container={host}>
        <TooltipProvider delay={0}>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipPopup>Helpful hint</TooltipPopup>
          </Tooltip>
        </TooltipProvider>
      </PortalContainerProvider>
    )

    await user.hover(screen.getByText('Hover me'))
    await waitFor(() => {
      expect(host.querySelector('[data-slot="tooltip-popup"]')).not.toBeNull()
    })

    host.remove()
  })

  it('supports detached triggers with typed payloads', async () => {
    const user = userEvent.setup()
    const handle = TooltipCreateHandle<{ label: string }>()

    render(
      <TooltipProvider delay={0}>
        <TooltipTrigger handle={handle} payload={{ label: 'First hint' }}>
          First
        </TooltipTrigger>
        <TooltipTrigger handle={handle} payload={{ label: 'Second hint' }}>
          Second
        </TooltipTrigger>
        <Tooltip handle={handle}>
          {({ payload }) => <TooltipPopup>{payload?.label}</TooltipPopup>}
        </Tooltip>
      </TooltipProvider>
    )

    await user.hover(screen.getByText('First'))
    expect(await screen.findByText('First hint')).toBeInTheDocument()

    await user.hover(screen.getByText('Second'))
    expect(await screen.findByText('Second hint')).toBeInTheDocument()
  })
})
