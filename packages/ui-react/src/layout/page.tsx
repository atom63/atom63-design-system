import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type { ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface PageProps extends useRender.ComponentProps<'main'> {
  noPadding?: boolean
}

/**
 * Renders `<main>` by default. Inside a shell that already owns the `main`
 * landmark, such as `SidebarInset`, pass `render={<div />}`.
 */
export function Page({ className, noPadding = false, render, ...props }: PageProps): ReactElement {
  const defaultProps = {
    className: cn('min-h-full', !noPadding && 'pt-8 pb-20', className),
    'data-slot': 'page',
  }
  return useRender({
    defaultTagName: 'main',
    props: mergeProps<'main'>(defaultProps, props),
    render,
  })
}
