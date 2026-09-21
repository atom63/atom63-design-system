// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it } from 'vitest'
import { DestinationIndicator, DestinationLink } from './destination-link'

function RouterLink({ children, href, ...props }: ComponentProps<'a'>) {
  return (
    <a data-router-link="" href={href} {...props}>
      {children ?? <span className="sr-only">Router link</span>}
    </a>
  )
}

describe('DestinationLink', () => {
  it('renders internal destinations through the supplied router link', () => {
    render(
      <DestinationLink
        aria-label="View project"
        href="/projects/atom63"
        kind="internal"
        render={<RouterLink href="/projects/atom63" />}
      />
    )

    const link = screen.getByRole('link', { name: 'View project' })
    expect(link.hasAttribute('data-router-link')).toBe(true)
    expect(link.hasAttribute('target')).toBe(false)
    expect(link.hasAttribute('rel')).toBe(false)
  })

  it('enforces native new-tab semantics for external destinations', () => {
    render(<DestinationLink aria-label="View source" href="https://example.com" kind="external" />)

    const link = screen.getByRole('link', { name: 'View source (opens in new tab)' })
    expect(link.hasAttribute('data-router-link')).toBe(false)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('announces external behavior when the visible child provides the label', () => {
    render(
      <DestinationLink href="https://example.com" kind="external">
        View source
      </DestinationLink>
    )

    expect(screen.getByRole('link', { name: 'View source (opens in new tab)' })).toBeInTheDocument()
  })
})

describe('DestinationIndicator', () => {
  it('exposes the destination kind on its icon', () => {
    const { container, rerender } = render(<DestinationIndicator kind="internal" />)
    expect(container.querySelector('[data-destination-kind="internal"]')).not.toBeNull()

    rerender(<DestinationIndicator kind="external" />)
    expect(container.querySelector('[data-destination-kind="external"]')).not.toBeNull()
  })
})
