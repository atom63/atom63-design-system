'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type { ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface PageProps extends useRender.ComponentProps<'main'> {
  /** Drops the block padding and the safe-area insets, for a shell that owns them. */
  noPadding?: boolean
}

/**
 * Renders `<main>` by default. Inside a shell that already owns the `main`
 * landmark, such as `SidebarInset`, pass `render={<div />}`.
 *
 * Page owns the route's bottom and inline safe-area insets: the bottom padding
 * grows by the bottom inset and the inline padding is the wider side inset,
 * which is 0 outside a notched or standalone screen. The top inset belongs to
 * the header above the page.
 *
 * Do not set inline padding (`px-*`, `ps-*`, `pe-*`) through `className`: it
 * replaces the safe-area inset. Put content padding on a `Container`
 * (`padding="x"`) or another element inside the page.
 */
export function Page({ className, noPadding = false, render, ...props }: PageProps): ReactElement {
  const defaultProps = {
    className: cn(
      'min-h-full',
      !noPadding &&
        'pt-8 pb-[calc(--spacing(20)+var(--a63-safe-area-bottom))] px-[max(var(--a63-safe-area-left),var(--a63-safe-area-right))]',
      className
    ),
    'data-slot': 'page',
  }
  return useRender({
    defaultTagName: 'main',
    props: mergeProps<'main'>(defaultProps, props),
    render,
  })
}
