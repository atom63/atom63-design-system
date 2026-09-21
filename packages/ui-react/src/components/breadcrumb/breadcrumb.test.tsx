import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb'

describe('Breadcrumb', () => {
  it('renders a labelled nav with the breadcrumb slot', () => {
    const { container } = render(<Breadcrumb />)
    const nav = container.querySelector('.a63-Breadcrumb')
    expect(nav).not.toBeNull()
    expect(nav?.tagName).toBe('NAV')
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb')
    expect(nav).toHaveAttribute('data-slot', 'breadcrumb')
  })

  it('renders a full trail with a link, separator, and current page', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )

    const link = container.querySelector('.a63-Breadcrumb-link')
    expect(link?.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/')
    expect(link).toHaveAttribute('data-slot', 'breadcrumb-link')

    const page = container.querySelector('.a63-Breadcrumb-page')
    expect(page).toHaveAttribute('aria-current', 'page')

    expect(container.querySelector('.a63-Breadcrumb-separator')).toHaveAttribute(
      'data-slot',
      'breadcrumb-separator'
    )
    expect(page).not.toHaveAttribute('role')
    expect(page).not.toHaveAttribute('aria-disabled')
  })

  it('BreadcrumbLink render prop swaps the element (asChild-equivalent)', () => {
    const { container } = render(
      <BreadcrumbLink render={<button type="button" />}>Back</BreadcrumbLink>
    )
    const el = container.querySelector('.a63-Breadcrumb-link')
    expect(el?.tagName).toBe('BUTTON')
    expect(el).toHaveTextContent('Back')
  })

  it('ellipsis renders an icon + an sr-only label', () => {
    const { container, getByText } = render(<BreadcrumbEllipsis />)
    const el = container.querySelector('.a63-Breadcrumb-ellipsis')
    expect(el).toHaveAttribute('data-slot', 'breadcrumb-ellipsis')
    expect(getByText('More')).toHaveClass('a63-Breadcrumb-sr-only')
    expect(el).not.toHaveAttribute('aria-hidden')
  })
})
