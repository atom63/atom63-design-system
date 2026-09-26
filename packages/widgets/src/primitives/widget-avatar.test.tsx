import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WidgetAvatar } from './widget-avatar'

function root(container: HTMLElement): Element | null {
  return container.querySelector('[data-slot="widget-avatar"]')
}

describe('WidgetAvatar', () => {
  it('renders the fallback and stamps the size', () => {
    const { container } = render(<WidgetAvatar fallback="YZ" size="lg" />)
    expect(screen.getByText('YZ')).toBeInTheDocument()
    expect(root(container)?.getAttribute('data-widget-avatar-size')).toBe('lg')
  })

  it('shows the shuffle affordance only when onShuffle is provided', () => {
    const { rerender } = render(<WidgetAvatar fallback="YZ" />)
    expect(screen.queryByRole('button', { name: 'Shuffle avatar' })).not.toBeInTheDocument()

    rerender(<WidgetAvatar fallback="YZ" onShuffle={() => {}} />)
    expect(screen.getByRole('button', { name: 'Shuffle avatar' })).toBeInTheDocument()
  })

  it('invokes onShuffle on click and disables while busy', () => {
    const onShuffle = vi.fn()
    const { rerender } = render(<WidgetAvatar fallback="YZ" onShuffle={onShuffle} />)
    const button = screen.getByRole('button', { name: 'Shuffle avatar' })
    button.click()
    expect(onShuffle).toHaveBeenCalledTimes(1)

    rerender(<WidgetAvatar busy fallback="YZ" onShuffle={onShuffle} />)
    expect(screen.getByRole('button', { name: 'Shuffle avatar' })).toBeDisabled()
  })

  it('renders the presence dot only when status is set', () => {
    const { container, rerender } = render(<WidgetAvatar fallback="YZ" />)
    expect(container.querySelector('[data-slot="widget-avatar-status"]')).not.toBeInTheDocument()

    rerender(<WidgetAvatar fallback="YZ" status />)
    expect(container.querySelector('[data-slot="widget-avatar-status"]')).toBeInTheDocument()
  })
})
