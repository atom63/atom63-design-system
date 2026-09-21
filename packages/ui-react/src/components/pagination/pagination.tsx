import { paginationContract } from '@atom63/ui-foundation'
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { Button, type ButtonProps } from '../button'

/* Pagination — the page-navigation cluster. Faithful port of prod @atom63/ui
   Pagination: a <nav> wrapping a <ul> of items; each interactive control is a
   link styled as a DS Button (outline when active, ghost otherwise) via Base
   UI's native `render` prop (prod used buttonVariants() on an <a>). */

export type PaginationProps = React.ComponentProps<'nav'>

export function Pagination({ className, ...props }: PaginationProps): React.ReactElement {
  return (
    <nav
      aria-label="pagination"
      className={cn('a63-Pagination', className)}
      data-slot="pagination"
      {...props}
    />
  )
}

export type PaginationContentProps = React.ComponentProps<'ul'>

export function PaginationContent({
  className,
  ...props
}: PaginationContentProps): React.ReactElement {
  return (
    <ul
      className={cn('a63-Pagination-content', className)}
      data-slot="pagination-content"
      {...props}
    />
  )
}

export type PaginationItemProps = React.ComponentProps<'li'>

export function PaginationItem(props: PaginationItemProps): React.ReactElement {
  return <li data-slot="pagination-item" {...props} />
}

export type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

export function PaginationLink({
  children,
  className,
  isActive,
  size = paginationContract.defaultLinkSize,
  ...props
}: PaginationLinkProps): React.ReactElement {
  return (
    <Button
      aria-current={isActive ? 'page' : undefined}
      className={cn('a63-Pagination-link', className)}
      data-active={isActive}
      data-slot="pagination-link"
      render={<a {...props}>{children}</a>}
      size={size}
      variant={isActive ? 'outline' : 'ghost'}
    />
  )
}

export type PaginationPreviousProps = React.ComponentProps<typeof PaginationLink>

export function PaginationPrevious({
  className,
  ...props
}: PaginationPreviousProps): React.ReactElement {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn('a63-Pagination-nav-link', className)}
      size="md"
      {...props}
    >
      <ChevronLeft aria-hidden />
      <span className="a63-Pagination-nav-label">Previous</span>
    </PaginationLink>
  )
}

export type PaginationNextProps = React.ComponentProps<typeof PaginationLink>

export function PaginationNext({ className, ...props }: PaginationNextProps): React.ReactElement {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn('a63-Pagination-nav-link', className)}
      size="md"
      {...props}
    >
      <span className="a63-Pagination-nav-label">Next</span>
      <ChevronRight aria-hidden />
    </PaginationLink>
  )
}

export type PaginationEllipsisProps = React.ComponentProps<'span'>

export function PaginationEllipsis({
  className,
  ...props
}: PaginationEllipsisProps): React.ReactElement {
  return (
    <span
      className={cn('a63-Pagination-ellipsis', className)}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <Ellipsis aria-hidden className="a63-Pagination-ellipsis-icon" />
      <span className="a63-Pagination-sr-only">More pages</span>
    </span>
  )
}
