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

  it('keeps one status region mounted across states, and mounts a fresh alert for an error', () => {
    const { container, rerender } = render(<FeedbackState state="loading" />)
    const region = container.querySelector('[data-slot="feedback-state"]')
    // A busy region's announcements are suppressed, so loading is not busy.
    expect(region).toHaveAttribute('role', 'status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).not.toHaveAttribute('aria-busy')

    for (const state of ['empty', 'not-found', 'no-results', 'offline', 'stale'] as const) {
      rerender(<FeedbackState state={state} />)
      expect(container.querySelector('[data-slot="feedback-state"]')).toBe(region)
      expect(region).toHaveAttribute('role', 'status')
      expect(region).toHaveAttribute('aria-live', 'polite')
    }

    rerender(<FeedbackState state="error" />)
    const alert = container.querySelector('[data-slot="feedback-state"]')
    // A live region that changes its role is not announced reliably; a new alert is.
    expect(alert).not.toBe(region)
    expect(alert).toHaveAttribute('role', 'alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('forwards native attributes and a ref to the root', () => {
    let node: HTMLDivElement | null = null
    const { container } = render(
      <FeedbackState
        aria-labelledby="heading"
        data-testid="state"
        id="orders-state"
        ref={element => {
          node = element
        }}
        style={{ minHeight: 120 }}
      />
    )
    const root = container.querySelector('[data-slot="feedback-state"]')
    expect(root).toHaveAttribute('id', 'orders-state')
    expect(root).toHaveAttribute('aria-labelledby', 'heading')
    expect(root).toHaveAttribute('data-testid', 'state')
    expect(node).toBe(root)
  })

  it('lets labels replace the no-results template', () => {
    const { getByText } = render(
      <FeedbackState
        labels={{ noResults: query => `Keine Ergebnisse für „${query}“` }}
        query="rot"
        state="no-results"
      />
    )
    expect(getByText('Keine Ergebnisse für „rot“')).toBeInTheDocument()
  })

  it('renders the title as a heading, level 3 unless set', () => {
    const { getByRole, rerender } = render(<FeedbackState state="not-found" />)
    expect(getByRole('heading', { level: 3, name: 'Nothing found' })).toHaveAttribute(
      'data-slot',
      'feedback-state-title'
    )

    rerender(<FeedbackState level={2} state="not-found" />)
    expect(getByRole('heading', { level: 2, name: 'Nothing found' })).toBeInTheDocument()

    rerender(<FeedbackState level={1} state="not-found" />)
    const h1 = getByRole('heading', { level: 1, name: 'Nothing found' })
    expect(h1.tagName).toBe('H1')
    expect(h1).not.toHaveAttribute('role')
  })

  it('falls back to the state config title + description', () => {
    const { getByText } = render(<FeedbackState state="not-found" />)
    expect(getByText('Nothing found')).toBeInTheDocument()
    expect(getByText("We couldn't find what you're looking for")).toBeInTheDocument()
  })

  it('keeps the friendly error description and shows an Error message as secondary detail', () => {
    const { container } = render(<FeedbackState error={new Error('Boom happened')} state="error" />)
    expect(container.querySelector('[data-slot="feedback-state-description"]')).toHaveTextContent(
      'An unexpected error occurred'
    )
    expect(container.querySelector('[data-slot="feedback-state-detail"]')).toHaveTextContent(
      'Boom happened'
    )
  })

  it('shows no detail outside the error state', () => {
    const { container } = render(<FeedbackState error={new Error('Boom')} state="empty" />)
    expect(container.querySelector('[data-slot="feedback-state-detail"]')).toBeNull()
  })

  it('lets labels replace every built-in title and description', () => {
    const titles = {
      empty: 'Noch nichts da',
      error: 'Etwas ist schiefgelaufen',
      loading: 'Wird geladen',
      'not-found': 'Nicht gefunden',
      'no-results': 'Keine Ergebnisse',
      offline: 'Du bist offline',
      stale: 'Gespeicherte Inhalte',
    } as const
    const descriptions = Object.fromEntries(
      Object.entries(titles).map(([kind, text]) => [kind, `${text}: Beschreibung`])
    )
    const { container, rerender } = render(<FeedbackState />)
    for (const state of Object.keys(titles) as (keyof typeof titles)[]) {
      rerender(<FeedbackState labels={{ descriptions, titles }} state={state} />)
      expect(container.querySelector('[data-slot="feedback-state-title"]')).toHaveTextContent(
        titles[state]
      )
      expect(container.querySelector('[data-slot="feedback-state-description"]')).toHaveTextContent(
        `${titles[state]}: Beschreibung`
      )
    }
    // The title and description props still win over labels.
    rerender(<FeedbackState description="D" labels={{ descriptions, titles }} title="T" />)
    expect(container.querySelector('[data-slot="feedback-state-title"]')).toHaveTextContent('T')
    expect(container.querySelector('[data-slot="feedback-state-description"]')).toHaveTextContent(
      'D'
    )
  })

  it('gives loading a description distinct from its title', () => {
    const { container } = render(<FeedbackState state="loading" />)
    const title = container.querySelector('[data-slot="feedback-state-title"]')?.textContent ?? ''
    const description =
      container.querySelector('[data-slot="feedback-state-description"]')?.textContent ?? ''
    expect(description.toLowerCase()).not.toContain(title.toLowerCase())
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
