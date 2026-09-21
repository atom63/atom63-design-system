import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '../button'
import { ButtonGroup } from '../button-group'

import {
  ConnectedPanel,
  ConnectedPanelBody,
  ConnectedPanelContent,
  ConnectedPanelDescription,
  ConnectedPanelHeader,
  ConnectedPanelTitle,
  ConnectedPanelTrigger,
} from './connected-panel'

function Example(props: { open?: boolean }) {
  return (
    <ConnectedPanel open={props.open}>
      <ConnectedPanelTrigger label="Category" summary="All" />
      <ConnectedPanelContent>
        <ConnectedPanelHeader>
          <ConnectedPanelTitle>Project category</ConnectedPanelTitle>
          <ConnectedPanelDescription>Choose which work appears.</ConnectedPanelDescription>
        </ConnectedPanelHeader>
        <ConnectedPanelBody>Body content</ConnectedPanelBody>
      </ConnectedPanelContent>
    </ConnectedPanel>
  )
}

describe('ConnectedPanel', () => {
  it('renders the surface + trigger with their slots', () => {
    const { container } = render(<Example />)
    const surface = container.querySelector('[data-slot="connected-panel"]')
    expect(surface).not.toBeNull()
    expect(surface).toHaveClass('a63-ConnectedPanel')
    expect(surface).toHaveAttribute('data-state', 'closed')
    const trigger = container.querySelector('[data-trigger-slot="connected-panel-trigger"]')
    expect(trigger).not.toBeNull()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('reflects the open state and exposes content parts', () => {
    render(<Example open />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(document.querySelector('[data-slot="connected-panel"]')).toHaveAttribute(
      'data-state',
      'open'
    )
    expect(document.querySelector('[data-slot="connected-panel-content"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="connected-panel-content-clip"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="connected-panel-content-inner"]')).not.toBeNull()
    expect(screen.getByText('Project category')).toHaveAttribute(
      'data-slot',
      'connected-panel-title'
    )
    expect(screen.getByText('Choose which work appears.')).toHaveAttribute(
      'data-slot',
      'connected-panel-description'
    )
    expect(screen.getByText('Body content')).toHaveAttribute('data-slot', 'connected-panel-body')
  })

  it('wraps in an aligned anchor for non-start alignment', () => {
    const { container } = render(
      <ConnectedPanel align="center">
        <ConnectedPanelTrigger label="X" />
      </ConnectedPanel>
    )
    const anchor = container.querySelector('[data-slot="connected-panel-anchor"]')
    expect(anchor).not.toBeNull()
    expect(anchor).toHaveAttribute('data-align', 'center')
  })

  it('composes a split trigger from ButtonGroup members', () => {
    const { container } = render(
      <ConnectedPanel variant="button-group">
        <ButtonGroup aria-label="Panel and actions">
          <ConnectedPanelTrigger label="Contents" showChevron={false} />
          <Button aria-label="More actions">More</Button>
        </ButtonGroup>
      </ConnectedPanel>
    )

    expect(container.querySelector('[data-slot="connected-panel"]')).toHaveAttribute(
      'data-variant',
      'button-group'
    )
    expect(screen.getByRole('group', { name: 'Panel and actions' })).toContainElement(
      screen.getByRole('button', { name: 'More actions' })
    )
  })

  it('can keep content mounted and inert while closed', () => {
    render(
      <ConnectedPanel open={false}>
        <ConnectedPanelTrigger label="Contents" />
        <ConnectedPanelContent forceMount>Preloaded content</ConnectedPanelContent>
      </ConnectedPanel>
    )

    const content = document.querySelector('[data-slot="connected-panel-content"]')
    expect(content).toHaveAttribute('aria-hidden', 'true')
    expect(content).toHaveAttribute('data-state', 'closed')
    expect(content).toHaveAttribute('inert')
    expect(screen.getByText('Preloaded content')).toBeInTheDocument()
  })
})
