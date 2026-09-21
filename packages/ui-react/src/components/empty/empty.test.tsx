import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyErrorDetail,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './empty'

describe('Empty', () => {
  it('renders each part with its class + data-slot', () => {
    const { container } = render(
      <Empty>
        <EmptyHeader>
          <EmptyMedia />
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>No content yet</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>content</EmptyContent>
      </Empty>
    )
    expect(container.querySelector('.a63-Empty')).toHaveAttribute('data-slot', 'empty')
    expect(container.querySelector('.a63-Empty-header')).toHaveAttribute(
      'data-slot',
      'empty-header'
    )
    expect(container.querySelector('.a63-Empty-media')).toHaveAttribute('data-slot', 'empty-icon')
    expect(container.querySelector('.a63-Empty-title')).toHaveAttribute('data-slot', 'empty-title')
    expect(container.querySelector('.a63-Empty-description')).toHaveAttribute(
      'data-slot',
      'empty-description'
    )
    expect(container.querySelector('.a63-Empty-content')).toHaveAttribute(
      'data-slot',
      'empty-content'
    )
  })

  it('defaults EmptyMedia to the default variant and honors the icon variant', () => {
    const { container, rerender } = render(<EmptyMedia />)
    expect(container.querySelector('.a63-Empty-media')).toHaveAttribute('data-variant', 'default')
    rerender(<EmptyMedia variant="icon" />)
    expect(container.querySelector('.a63-Empty-media')).toHaveAttribute('data-variant', 'icon')
  })

  it('collapses/expands the error detail and shows the error text + copy button', () => {
    const { container, getByRole, queryByText } = render(<EmptyErrorDetail error="Boom happened" />)
    expect(queryByText('Boom happened')).toBeNull()
    const toggle = getByRole('button', { name: 'Show details' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(queryByText('Boom happened')).not.toBeNull()
    expect(getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true')
    expect(container.querySelector('[data-slot="empty-error-detail"]')).toHaveAttribute(
      'data-state',
      'expanded'
    )
    // the collapsed error box embeds a CopyButton (a DS button)
    expect(container.querySelector('.a63-CopyButton')).not.toBeNull()
    fireEvent.click(getByRole('button', { name: 'Hide details' }))
    expect(queryByText('Boom happened')).toBeNull()
  })
})
