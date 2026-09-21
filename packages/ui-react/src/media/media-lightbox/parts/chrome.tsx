'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type { ReactNode } from 'react'
import type * as React from 'react'
import { useLightboxConfig, useLightboxState } from './context'

export type LightboxCloseProps = useRender.ComponentProps<'button'>

/** Closes the lightbox. */
export function LightboxClose({
  className,
  render,
  ...props
}: LightboxCloseProps): React.ReactElement {
  const { labels } = useLightboxConfig()
  const { close } = useLightboxState()

  const defaultProps = {
    'aria-label': labels.close,
    className,
    'data-slot': 'media-lightbox-close',
    onClick: close,
    type: 'button' as const,
  }

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  })
}

export type LightboxPreviousProps = useRender.ComponentProps<'button'>

/** Steps to the previous slide; disabled on the first item. */
export function LightboxPrevious({
  className,
  render,
  ...props
}: LightboxPreviousProps): React.ReactElement {
  const { labels } = useLightboxConfig()
  const { goTo, index } = useLightboxState()
  const disabled = index <= 0

  const defaultProps = {
    'aria-label': labels.previous,
    className,
    'data-slot': 'media-lightbox-previous',
    disabled,
    onClick: () => {
      goTo(index - 1)
    },
    type: 'button' as const,
    ...(disabled ? { 'data-disabled': '' } : {}),
  }

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  })
}

export type LightboxNextProps = useRender.ComponentProps<'button'>

/** Steps to the next slide; disabled on the last item. */
export function LightboxNext({
  className,
  render,
  ...props
}: LightboxNextProps): React.ReactElement {
  const { labels } = useLightboxConfig()
  const { goTo, index, itemCount } = useLightboxState()
  const disabled = index >= itemCount - 1

  const defaultProps = {
    'aria-label': labels.next,
    className,
    'data-slot': 'media-lightbox-next',
    disabled,
    onClick: () => {
      goTo(index + 1)
    },
    type: 'button' as const,
    ...(disabled ? { 'data-disabled': '' } : {}),
  }

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  })
}

export type LightboxCounterProps = Omit<useRender.ComponentProps<'p'>, 'children'> & {
  children?: (current: number, total: number) => ReactNode
}

/** The active item's position, e.g. "3 of 7". Pass `children` to re-shape it. */
export function LightboxCounter({
  children,
  className,
  render,
  ...props
}: LightboxCounterProps): React.ReactElement {
  const { items, labels } = useLightboxConfig()
  const { index } = useLightboxState()
  const total = items.length
  const current = index + 1

  const defaultProps = {
    // "3 of 7" is a run of digits either side of a word, which a
    // right-to-left paragraph reorders into "of 7 3"; taking the direction
    // from the text itself keeps an English counter readable inside an RTL
    // gallery and lets a translated one read right to left.
    children: children ? children(current, total) : labels.position(index, total),
    className,
    'data-slot': 'media-lightbox-counter',
    dir: 'auto',
  }

  return useRender({
    defaultTagName: 'p',
    props: mergeProps<'p'>(defaultProps, props),
    render,
  })
}

export type LightboxCaptionProps = useRender.ComponentProps<'p'>

/** The active item's caption; renders nothing when the item has none. */
export function LightboxCaption({
  className,
  render,
  ...props
}: LightboxCaptionProps): React.ReactElement | null {
  const { items } = useLightboxConfig()
  const { index } = useLightboxState()
  const item = items[index]

  const defaultProps = {
    children: item?.caption ?? '',
    className,
    'data-slot': 'media-lightbox-caption',
  }

  // `useRender` is called unconditionally to satisfy the rules of hooks; the
  // element it produces is only returned once the active item has a caption.
  const element = useRender({
    defaultTagName: 'p',
    props: mergeProps<'p'>(defaultProps, props),
    render,
  })

  return item?.caption ? element : null
}
