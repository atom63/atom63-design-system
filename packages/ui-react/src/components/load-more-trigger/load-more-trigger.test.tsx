import { fireEvent, render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { LoadMoreTrigger } from './load-more-trigger'

describe('LoadMoreTrigger', () => {
  it('renders nothing when there is no more and nothing is loading', () => {
    const { container } = render(<LoadMoreTrigger hasMore={false} isLoading={false} />)
    expect(container.querySelector('[data-slot="load-more-trigger"]')).toBeNull()
  })

  it('renders the idle message when there is more to load', () => {
    const { container, getByText } = render(<LoadMoreTrigger hasMore isLoading={false} />)
    const el = container.querySelector('.a63-LoadMoreTrigger')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'load-more-trigger')
    expect(el).toHaveAttribute('data-state', 'idle')
    expect(getByText('Scroll down to load more')).toBeInTheDocument()
    // idle: no live region
    expect(el).not.toHaveAttribute('role')
  })

  it('renders the loading message + spinner + status role while loading', () => {
    const { container, getByText } = render(<LoadMoreTrigger hasMore isLoading />)
    const el = container.querySelector('.a63-LoadMoreTrigger')
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toHaveAttribute('aria-live', 'polite')
    expect(el).toHaveAttribute('data-state', 'loading')
    expect(el).toHaveAttribute('data-tone', 'info')
    expect(getByText('Loading more...')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="load-more-trigger-spinner"]')).not.toBeNull()
  })

  it('renders a semantic failed state with a retry action', () => {
    const onRetry = vi.fn()
    const { container, getByRole, getByText } = render(
      <LoadMoreTrigger onRetry={onRetry} state="failed" />
    )

    const el = container.querySelector('.a63-LoadMoreTrigger')
    expect(el).toHaveAttribute('data-state', 'failed')
    expect(el).toHaveAttribute('data-tone', 'error')
    expect(getByText('Couldn’t load more')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders a semantic exhausted state instead of hiding it when requested', () => {
    const { container, getByText } = render(<LoadMoreTrigger state="exhausted" />)

    const el = container.querySelector('.a63-LoadMoreTrigger')
    expect(el).toHaveAttribute('data-state', 'exhausted')
    expect(el).toHaveAttribute('data-tone', 'success')
    expect(getByText('All items loaded')).toBeInTheDocument()
  })

  it('honors custom messages + variant', () => {
    const { container, getByText } = render(
      <LoadMoreTrigger hasMore idleMessage="More below" isLoading={false} variant="prominent" />
    )
    expect(getByText('More below')).toBeInTheDocument()
    expect(container.querySelector('[data-variant="prominent"]')).not.toBeNull()
  })

  it('renders custom children instead of the default message', () => {
    const { getByText, container } = render(
      <LoadMoreTrigger hasMore isLoading={false}>
        <button type="button">Load more</button>
      </LoadMoreTrigger>
    )
    expect(getByText('Load more')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="load-more-trigger"]')).toHaveAttribute(
      'data-state',
      'custom'
    )
    expect(container.querySelector('.a63-LoadMoreTrigger-message')).toBeNull()
  })

  it('forwards the ref to the sentinel div', () => {
    const ref = createRef<HTMLDivElement>()
    render(<LoadMoreTrigger hasMore isLoading={false} ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'load-more-trigger')
  })
})
