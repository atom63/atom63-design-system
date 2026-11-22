import { paginationContract } from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import type { useRender } from '@base-ui/react/use-render'
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react'
import { cloneElement, isValidElement } from 'react'
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
      aria-label="Pagination"
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
  /** Marks the control as unavailable (Previous on the first page, Next on the last): the
   *  link loses its href and click handler, leaves the tab order and is announced as disabled. */
  disabled?: boolean
  /** Replaces the rendered `<a>`, such as with a router link (`render={<Link to="/page/2" />}`)
   *  or a function of the merged props. The element must spread the props it receives and
   *  forward its ref. Ignored while `disabled`, which always renders an `<a>` without an href. */
  render?: useRender.RenderProp
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

export function PaginationLink({
  children,
  className,
  disabled = false,
  isActive,
  render,
  size = paginationContract.defaultLinkSize,
  ...props
}: PaginationLinkProps): React.ReactElement {
  // A link without an href is not focusable; role="link" with aria-disabled keeps it
  // announced as an unavailable link rather than as plain text.
  const anchorProps: React.ComponentProps<'a'> = disabled
    ? { ...props, 'aria-disabled': true, href: undefined, onClick: undefined, role: 'link' }
    : props
  const renderLink: useRender.RenderProp = (buttonProps, state) => {
    // Button's own <button> attributes do not belong on a link.
    const {
      disabled: _disabled,
      type: _type,
      ...rest
    } = buttonProps as React.ComponentProps<'button'>
    const merged = {
      ...mergeProps<'a'>(rest as React.ComponentProps<'a'>, anchorProps),
      children,
      'data-disabled': disabled ? '' : undefined,
    }
    if (typeof render === 'function' && !disabled) return render(merged, state)
    if (isValidElement<Record<string, unknown>>(render) && !disabled) {
      return cloneElement(render, mergeProps(merged, render.props))
    }
    return <a {...merged}>{merged.children}</a>
  }
  return (
    <Button
      aria-current={isActive ? 'page' : undefined}
      className={cn('a63-Pagination-link', className)}
      data-active={isActive}
      data-slot="pagination-link"
      render={renderLink}
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
