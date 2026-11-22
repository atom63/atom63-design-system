import { render } from '@testing-library/react'
import type * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

describe('Pagination', () => {
  it('renders the nav + content + item slots', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#1">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    const nav = container.querySelector('.a63-Pagination')
    expect(nav?.tagName.toLowerCase()).toBe('nav')
    expect(nav).toHaveAttribute('data-slot', 'pagination')
    expect(nav).toHaveAttribute('aria-label', 'Pagination')
    expect(container.querySelector('[data-slot="pagination-content"]')?.tagName.toLowerCase()).toBe(
      'ul'
    )
    expect(container.querySelector('[data-slot="pagination-item"]')?.tagName.toLowerCase()).toBe(
      'li'
    )
  })

  it('renders the link as an anchor and marks the active page', () => {
    const { container } = render(
      <PaginationLink href="#2" isActive>
        2
      </PaginationLink>
    )
    const link = container.querySelector('[data-trigger-slot="pagination-link"]')
    expect(link?.tagName.toLowerCase()).toBe('a')
    expect(link).toHaveAttribute('href', '#2')
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveAttribute('data-active', 'true')
    expect(link).toHaveAttribute('data-variant', 'outline')
  })

  it('inactive link uses the ghost variant', () => {
    const { container } = render(<PaginationLink href="#3">3</PaginationLink>)
    expect(container.querySelector('[data-trigger-slot="pagination-link"]')).toHaveAttribute(
      'data-variant',
      'ghost'
    )
  })

  it('renders labelled previous / next controls', () => {
    const { container, getByLabelText } = render(
      <>
        <PaginationPrevious href="#p" />
        <PaginationNext href="#n" />
      </>
    )
    expect(getByLabelText('Go to previous page')).toBeInTheDocument()
    expect(getByLabelText('Go to next page')).toBeInTheDocument()
    expect(container.querySelectorAll('.a63-Pagination-nav-label')).toHaveLength(2)
  })

  it('renders through a render element such as a router link', () => {
    function RouterLink({ to, ...props }: React.ComponentProps<'a'> & { to: string }) {
      return (
        <a data-router="" href={`/app${to}`} {...props}>
          {props.children}
        </a>
      )
    }
    const { container } = render(
      <PaginationLink isActive render={<RouterLink to="/page/2" />}>
        2
      </PaginationLink>
    )
    const link = container.querySelector('[data-trigger-slot="pagination-link"]')
    expect(link).toHaveAttribute('data-router')
    expect(link).toHaveAttribute('href', '/app/page/2')
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveClass('a63-Pagination-link')
    expect(link).toHaveTextContent('2')
    expect(link).not.toHaveAttribute('type')
  })

  it('renders through a render function', () => {
    const { container } = render(
      <PaginationLink
        href="#4"
        render={props => (
          <a {...props} data-fn="">
            {props.children}
          </a>
        )}
      >
        4
      </PaginationLink>
    )
    const link = container.querySelector('[data-trigger-slot="pagination-link"]')
    expect(link).toHaveAttribute('data-fn')
    expect(link).toHaveAttribute('href', '#4')
  })

  it('disables previous / next: no href, not focusable, announced as disabled', () => {
    const onClick = vi.fn()
    const { getByLabelText } = render(
      <>
        <PaginationPrevious disabled href="#p" onClick={onClick} />
        <PaginationNext href="#n" />
      </>
    )
    const previous = getByLabelText('Go to previous page')
    expect(previous.tagName.toLowerCase()).toBe('a')
    expect(previous).not.toHaveAttribute('href')
    expect(previous).toHaveAttribute('role', 'link')
    expect(previous).toHaveAttribute('aria-disabled', 'true')
    expect(previous).toHaveAttribute('data-disabled')
    previous.focus()
    expect(previous).not.toHaveFocus()
    previous.click()
    expect(onClick).not.toHaveBeenCalled()
    expect(getByLabelText('Go to next page')).toHaveAttribute('href', '#n')
    expect(getByLabelText('Go to next page')).not.toHaveAttribute('aria-disabled')
  })

  it('renders the ellipsis slot', () => {
    const { container } = render(<PaginationEllipsis />)
    const el = container.querySelector('[data-slot="pagination-ellipsis"]')
    expect(el).not.toBeNull()
    expect(el).not.toHaveAttribute('aria-hidden')
    expect(el).toHaveTextContent('More pages')
  })
})
