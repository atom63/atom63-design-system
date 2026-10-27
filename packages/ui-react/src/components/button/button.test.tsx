import { buttonContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('applies data-variant and data-size', () => {
    render(
      <Button size="lg" variant="primary">
        Go
      </Button>
    )
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el).toHaveAttribute('data-variant', 'primary')
    expect(el).toHaveAttribute('data-size', 'lg')
  })

  it('falls back to the contract defaults', () => {
    render(<Button>Default</Button>)
    const el = screen.getByRole('button', { name: 'Default' })
    expect(el).toHaveAttribute('data-variant', buttonContract.defaultVariant)
    expect(el).toHaveAttribute('data-size', buttonContract.defaultSize)
  })

  it('defaults to the neutral tone and takes muted', () => {
    const { rerender } = render(<Button variant="ghost">Share</Button>)
    expect(screen.getByRole('button', { name: 'Share' })).toHaveAttribute(
      'data-tone',
      buttonContract.defaultTone
    )
    rerender(
      <Button tone="muted" variant="ghost">
        Share
      </Button>
    )
    expect(screen.getByRole('button', { name: 'Share' })).toHaveAttribute('data-tone', 'muted')
  })

  it('marks loading state', () => {
    render(<Button loading>Busy</Button>)
    const el = screen.getByRole('button', { name: 'Busy' })
    expect(el).toHaveAttribute('data-loading', '')
    expect(el).toHaveAttribute('aria-busy', 'true')
    expect(el).toBeDisabled()
  })

  it('sets data-button on the root', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('data-button', '')
  })

  it('mirrors data-slot prop to data-trigger-slot', () => {
    render(<Button data-slot="dialog-trigger">Open</Button>)
    const el = screen.getByRole('button', { name: 'Open' })
    expect(el).toHaveAttribute('data-slot', 'button')
    expect(el).toHaveAttribute('data-trigger-slot', 'dialog-trigger')
  })

  it('does not set data-trigger-slot without a data-slot prop', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).not.toHaveAttribute('data-trigger-slot')
  })

  it('keeps the label in the DOM while loading', () => {
    render(<Button loading>Busy</Button>)
    const el = screen.getByRole('button', { name: 'Busy' })
    expect(el.querySelector('[data-slot="button-label"]')).toBeTruthy()
    expect(el.querySelector('[data-slot="button-spinner"]')).toBeTruthy()
  })

  it('defaults to the default shape and takes round', () => {
    const { rerender } = render(<Button>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('data-shape', 'default')
    rerender(<Button shape="round">Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('data-shape', 'round')
  })

  it('adds a dot indicator to an aria-label and a count to visible text', () => {
    const { rerender } = render(<Button aria-label="Notifications" indicator />)
    expect(screen.getByRole('button', { name: 'Notifications, New' })).toBeInTheDocument()
    rerender(<Button indicator={4}>Inbox</Button>)
    expect(screen.getByRole('button', { name: 'Inbox, 4 new' })).toBeInTheDocument()
    rerender(
      <Button aria-label="Mail" indicator={120} indicatorLabel="120 unread">
        x
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Mail, 120 unread' })
    expect(button.querySelector('[data-slot="button-indicator"]')).toHaveTextContent('99+')
  })

  it('draws no indicator for false or a zero count', () => {
    const { container, rerender } = render(<Button indicator={0}>Inbox</Button>)
    expect(container.querySelector('[data-slot="button-indicator"]')).toBeNull()
    rerender(<Button indicator={false}>Inbox</Button>)
    expect(screen.getByRole('button', { name: 'Inbox' })).toBeInTheDocument()
  })
})
