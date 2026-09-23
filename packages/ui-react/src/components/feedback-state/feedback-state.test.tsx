import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FeedbackState } from './feedback-state'

describe('FeedbackState', () => {
  it('renders the root with default state + size + slot', () => {
    const { container } = render(<FeedbackState />)
    const el = container.querySelector('.a63-FeedbackState')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'feedback-state')
    expect(el).toHaveAttribute('data-state', 'empty')
    expect(el).toHaveAttribute('data-size', 'panel')
  })

  it('applies the given state + size', () => {
    const { container } = render(<FeedbackState size="page" state="error" />)
    const el = container.querySelector('.a63-FeedbackState')
    expect(el).toHaveAttribute('data-state', 'error')
    expect(el).toHaveAttribute('data-size', 'page')
  })

  it('announces loading and error states', () => {
    const { container, rerender } = render(<FeedbackState state="loading" />)
    const state = container.querySelector('[data-slot="feedback-state"]')
    expect(state).toHaveAttribute('role', 'status')
    expect(state).toHaveAttribute('aria-busy', 'true')

    rerender(<FeedbackState state="error" />)
    expect(state).toHaveAttribute('role', 'alert')
    expect(state).toHaveAttribute('aria-live', 'assertive')
  })

  it('falls back to the state config title + description', () => {
    const { getByText } = render(<FeedbackState state="not-found" />)
    expect(getByText('Nothing found')).toBeInTheDocument()
    expect(getByText("We couldn't find what you're looking for")).toBeInTheDocument()
  })

  it('derives the description from an Error when state is error', () => {
    const { getByText } = render(<FeedbackState error={new Error('Boom happened')} state="error" />)
    expect(getByText('Boom happened')).toBeInTheDocument()
  })

  it('builds the no-results description from the query', () => {
    const { getByText } = render(<FeedbackState query="widgets" state="no-results" />)
    expect(getByText('No results found for "widgets"')).toBeInTheDocument()
  })

  it('renders offline and stale repository intent', () => {
    const { getByText, rerender } = render(<FeedbackState state="offline" />)
    expect(getByText('You are offline')).toBeInTheDocument()

    rerender(<FeedbackState state="stale" />)
    expect(getByText('Showing saved content')).toBeInTheDocument()
  })

  it('renders the media icon by default and hides it when showIcon is false', () => {
    const { container, rerender } = render(<FeedbackState />)
    expect(container.querySelector('[data-slot="feedback-state-media"]')).not.toBeNull()
    rerender(<FeedbackState showIcon={false} />)
    expect(container.querySelector('[data-slot="feedback-state-media"]')).toBeNull()
  })

  it('renders a built-in action icon such as refreshCw', () => {
    const { getByRole } = render(
      <FeedbackState
        actions={[{ icon: 'refreshCw', label: 'Retry', onClick: () => {} }]}
        state="error"
      />
    )
    expect(getByRole('button', { name: 'Retry' }).querySelector('svg')).not.toBeNull()
  })

  it('renders a custom icon element in the media slot and on actions', () => {
    const { container, getByRole } = render(
      <FeedbackState
        actions={[{ icon: <svg data-testid="custom-action" />, label: 'Open' }]}
        icon={<svg data-testid="custom-media" />}
      />
    )
    expect(
      container.querySelector('[data-slot="feedback-state-media"] [data-testid="custom-media"]')
    ).not.toBeNull()
    expect(
      getByRole('button', { name: 'Open' }).querySelector('[data-testid="custom-action"]')
    ).not.toBeNull()
  })

  it('rejects unknown icon names at compile time and renders no icon at runtime', () => {
    // @ts-expect-error -- names outside the built-in set are a type error.
    const { container } = render(<FeedbackState icon="notAnIcon" />)
    expect(container.querySelector('[data-slot="feedback-state-media"]')).toBeNull()
  })

  it('renders action buttons (onClick + href)', () => {
    const { getByRole } = render(
      <FeedbackState
        actions={[
          { label: 'Retry', onClick: () => {} },
          { href: '/', label: 'Go home' },
        ]}
        state="error"
      />
    )
    expect(getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    const link = getByRole('link', { name: 'Go home' })
    expect(link).toHaveAttribute('href', '/')
  })

  it('preserves long descriptions for assistive technology and visual wrapping', () => {
    const long = 'x'.repeat(150)
    const { container } = render(<FeedbackState description={long} />)
    const desc = container.querySelector('[data-slot="feedback-state-description"]')
    expect(desc).toHaveTextContent(long)
    expect(desc).not.toHaveAttribute('title')
  })
})
