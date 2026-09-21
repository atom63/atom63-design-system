'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { ChevronRight, Ellipsis } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/cn'

/* Breadcrumb — a hierarchical navigation trail. Faithful to prod @atom63/ui:
   a <nav> → <ol> of items, muted links that darken on hover, a non-interactive
   current page, chevron separators, and an ellipsis for collapsed segments.
   The default separator/ellipsis glyphs are inline SVGs (no icon-font dep),
   overridable via children. Chrome reads --a63-* tokens. */

export function Breadcrumb({
  className,
  ...props
}: React.ComponentProps<'nav'>): React.ReactElement {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn('a63-Breadcrumb', className)}
      data-slot="breadcrumb"
      {...props}
    />
  )
}

export function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<'ol'>): React.ReactElement {
  return (
    <ol className={cn('a63-Breadcrumb-list', className)} data-slot="breadcrumb-list" {...props} />
  )
}

export function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<'li'>): React.ReactElement {
  return (
    <li className={cn('a63-Breadcrumb-item', className)} data-slot="breadcrumb-item" {...props} />
  )
}

export type BreadcrumbLinkProps = useRender.ComponentProps<'a'> & {
  /** @deprecated Use `render` instead */
  asChild?: boolean
}

export function BreadcrumbLink({
  className,
  render,
  asChild = false,
  children,
  ...props
}: BreadcrumbLinkProps): React.ReactElement {
  // asChild consumes `children` AS the rendered element (don't re-render it);
  // an explicit `render` prop keeps `children` so they render inside it.
  const childrenAsRender = !render && asChild && React.isValidElement(children)
  const resolvedRender = render ?? (childrenAsRender ? children : undefined)

  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        children: childrenAsRender ? undefined : children,
        className: cn('a63-Breadcrumb-link', className),
      },
      props,
      { 'data-slot': 'breadcrumb-link' } as React.ComponentProps<'a'>
    ),
    render: resolvedRender,
    state: {
      slot: 'breadcrumb-link',
    },
  })
}

export function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return (
    <span
      aria-current="page"
      className={cn('a63-Breadcrumb-page', className)}
      data-slot="breadcrumb-page"
      {...props}
    />
  )
}

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>): React.ReactElement {
  return (
    <li
      aria-hidden="true"
      className={cn('a63-Breadcrumb-separator', className)}
      data-slot="breadcrumb-separator"
      role="presentation"
      {...props}
    >
      {children ?? <ChevronRight aria-hidden className="a63-Breadcrumb-separator-glyph" />}
    </li>
  )
}

export function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return (
    <span
      className={cn('a63-Breadcrumb-ellipsis', className)}
      data-slot="breadcrumb-ellipsis"
      {...props}
    >
      <Ellipsis aria-hidden className="a63-Breadcrumb-ellipsis-glyph" />
      <span className="a63-Breadcrumb-sr-only">More</span>
    </span>
  )
}
