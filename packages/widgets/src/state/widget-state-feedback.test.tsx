import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { WidgetSurface } from '../primitives'
import { declarations } from '../test/css'
import { WidgetStateFeedback } from './widget-state-feedback'

describe('WidgetStateFeedback', () => {
  it('keeps compact errors minimal with stable recovery controls', async () => {
    const { container } = render(
      <WidgetSurface size="small">
        <WidgetStateFeedback
          copy={{
            description: 'Technical detail remains available in the compact tile.',
            title: 'Unable to load',
          }}
          onRetry={() => {}}
          state="error"
        />
      </WidgetSurface>
    )

    expect(screen.getByText('Unable to load')).toBeInTheDocument()
    expect(screen.queryByText(/Technical detail remains/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveAttribute('data-size', 'sm')
    fireEvent.click(screen.getByRole('button', { name: 'View error details' }))
    expect(await screen.findByText(/Technical detail remains/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy details' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View error details' })).toHaveAttribute(
      'data-size',
      'icon-sm'
    )
    expect(container.querySelector('[data-slot="widget-state-feedback"]')).toHaveAttribute(
      'data-density',
      'compact'
    )
    expect(declarations('.a63-WidgetStateFeedback')).toMatchObject({
      gap: 'var(--a63-space-2)',
      'padding-block': 'var(--a63-space-2)',
      'padding-inline': 'var(--a63-space-3)',
    })
  })

  it.each(['loading', 'empty'] as const)('announces the %s state as a status', state => {
    render(
      <WidgetSurface size="small">
        <WidgetStateFeedback copy={{ description: 'Detail', title: 'Title' }} state={state} />
      </WidgetSurface>
    )
    expect(screen.getByRole('status')).toHaveAttribute('data-state', state)
    expect(screen.getByText('Detail')).toBeInTheDocument()
  })

  it('uses the large density on the 2x2 footprint', () => {
    const { container } = render(
      <WidgetSurface size="large">
        <WidgetStateFeedback copy={{ title: 'Loading' }} state="loading" />
      </WidgetSurface>
    )
    expect(container.querySelector('[data-slot="widget-state-feedback"]')).toHaveAttribute(
      'data-density',
      'large'
    )
  })

  it.each(['loading', 'empty', 'error'] as const)(
    'has no axe violations in the %s state',
    async state => {
      const { container } = render(
        <WidgetSurface size="medium">
          <WidgetStateFeedback
            copy={{ description: 'Detail', title: 'Title' }}
            onRetry={() => undefined}
            state={state}
          />
        </WidgetSurface>
      )
      expect(await axe(container)).toHaveNoViolations()
    }
  )

  it('renders 1x1 and 2x1 at one density, because they differ in width not height', () => {
    // These used to step apart, which put a 28px badge beside a 32px one in
    // tiles of identical height on atom63.io.
    const read = (size: 'small' | 'medium') => {
      const { container, unmount } = render(
        <WidgetSurface size={size}>
          <WidgetStateFeedback copy={{ title: 'Unable to load' }} state="error" />
        </WidgetSurface>
      )
      const root = container.querySelector('[data-slot="widget-state-feedback"]')
      const badge = root?.firstElementChild
      const classes = { badge: badge?.className, root: root?.className }
      unmount()
      return classes
    }

    expect(read('small')).toEqual(read('medium'))
  })

  it('keeps medium recovery controls from compressing', () => {
    render(
      <WidgetSurface size="medium">
        <WidgetStateFeedback
          copy={{
            description: 'Technical detail that should not crowd a short tile.',
            title: 'Unable to load',
          }}
          onRetry={() => {}}
          size="medium"
          state="error"
        />
      </WidgetSurface>
    )

    expect(screen.getByText('Unable to load')).toBeInTheDocument()
    expect(screen.queryByText(/Technical detail/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveClass(
      'a63-Button',
      'a63-WidgetStateFeedback-action'
    )
    expect(declarations('.a63-WidgetStateFeedback-action')['flex-shrink']).toBe('0')
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveAttribute('data-size', 'sm')
    expect(screen.getByRole('button', { name: 'View error details' })).toBeInTheDocument()
  })

  it('moves large-footprint technical detail into the same disclosure', () => {
    render(
      <WidgetSurface size="large">
        <WidgetStateFeedback
          copy={{ description: 'Useful recovery detail.', title: 'Unable to load' }}
          size="large"
          state="error"
        />
      </WidgetSurface>
    )

    expect(screen.queryByText('Useful recovery detail.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View error details' })).toBeInTheDocument()
  })
})
