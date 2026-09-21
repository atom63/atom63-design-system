'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { Moon, Sun } from 'lucide-react'
import type * as React from 'react'
import { DestinationIndicator, DestinationLink } from '../../../components/destination-link'
import { useLightboxConfig, useLightboxState } from './context'

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

export type LightboxAppearanceToggleProps = useRender.ComponentProps<'button'>

/**
 * Switches the active item between its light and dark source. Renders
 * nothing unless the item has both variants and the caller wired
 * `onAppearanceChange`.
 */
export function LightboxAppearanceToggle({
  className,
  render,
  ...props
}: LightboxAppearanceToggleProps): React.ReactElement | null {
  const { appearance, items, labels, onAppearanceChange } = useLightboxConfig()
  const { index } = useLightboxState()
  const item = items[index]
  const canToggle = Boolean(item?.lightSrc && item.darkSrc && onAppearanceChange)

  const isDark = (appearance?.[item?.id ?? ''] ?? 'dark') !== 'light'
  const target = isDark ? 'light' : 'dark'

  const defaultProps = {
    'aria-label': item ? labels.appearance(item.title, target) : undefined,
    children: isDark ? (
      <Sun aria-hidden className="size-5" />
    ) : (
      <Moon aria-hidden className="size-5" />
    ),
    className,
    'data-slot': 'media-lightbox-appearance-toggle',
    onClick: () => {
      if (item) {
        onAppearanceChange?.(item.id, target)
      }
    },
    type: 'button' as const,
  }

  // `useRender` is called unconditionally to satisfy the rules of hooks; the
  // element it produces is only returned once the active item has both
  // variants and the caller wired `onAppearanceChange`.
  const element = useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  })

  return canToggle ? element : null
}

export type LightboxDestinationProps = Omit<
  React.ComponentProps<typeof DestinationLink>,
  'href' | 'kind'
>

/**
 * A secondary destination link for the active item; renders nothing when it
 * has no `href`.
 */
export function LightboxDestination({
  children,
  className,
  // Internal links always render through `item.renderHref`; a caller-supplied
  // `render` would silently be dropped by `DestinationLink` for external
  // links anyway, so it is deliberately not accepted here.
  render: _render,
  ...props
}: LightboxDestinationProps): React.ReactElement | null {
  const { items, labels } = useLightboxConfig()
  const { index } = useLightboxState()
  const item = items[index]

  if (!item?.href) {
    return null
  }

  const external = isExternalHref(item.href)

  // `DestinationLink` owns `data-slot="destination-link"` from its own
  // contract (see `mergeProps` order in `destination-link.tsx`, where its
  // internal slot always wins), so this wrapper does not fight it with a
  // second one.
  return (
    <DestinationLink
      aria-label={labels.openDestination(item.title)}
      className={className}
      href={item.href}
      kind={external ? 'external' : 'internal'}
      render={external ? undefined : item.renderHref}
      {...props}
    >
      {children ?? (
        <DestinationIndicator className="size-5" kind={external ? 'external' : 'internal'} />
      )}
    </DestinationLink>
  )
}
