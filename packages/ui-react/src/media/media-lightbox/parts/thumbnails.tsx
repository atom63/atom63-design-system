'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import type * as React from 'react'
import { cn } from '../../../lib/cn'
import { resolveMediaSrc, resolveThumbSrc } from '../slide-media'
import type { MediaLightboxItem } from '../types'
import { useLightboxConfig, useLightboxState } from './context'
import { useLightboxThumbnailsRegistry } from './thumbnails-registry'

export interface LightboxThumbnailContextValue {
  item: MediaLightboxItem
  index: number
  isActive: boolean
}

const LightboxThumbnailContext = createContext<LightboxThumbnailContextValue | null>(null)

function useLightboxThumbnail(): LightboxThumbnailContextValue {
  const value = useContext(LightboxThumbnailContext)
  if (value === null) {
    throw new Error('Lightbox.Thumbnail must be rendered inside Lightbox.Thumbnails.')
  }
  return value
}

export type LightboxThumbnailsProps = Omit<useRender.ComponentProps<'div'>, 'children'> & {
  /** Omit to render a default `LightboxThumbnail` per item. */
  children?: (thumbnail: LightboxThumbnailContextValue) => ReactNode
}

/**
 * A tablist that hosts a `LightboxThumbnail` for every item, reproducing
 * `ThumbnailStrip`'s roving tabindex: arrow keys move within the strip,
 * `Home`/`End` jump to its ends, only the active thumb is tabbable, and it
 * scrolls into view as the gallery turns pages.
 *
 * Registers its presence into the thumbnails registry so `Slide` can point
 * its `aria-labelledby` at the matching thumb.
 */
export function LightboxThumbnails({
  children,
  className,
  ref,
  render,
  ...props
}: LightboxThumbnailsProps): React.ReactElement {
  const { items, labels, reducedMotion } = useLightboxConfig()
  const { goTo, index } = useLightboxState()
  const register = useLightboxThumbnailsRegistry()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    register(true)
    return () => {
      register(false)
    }
  }, [register])

  // A second read-out of the same page turn the photo is animating, so a
  // hard cut next to a moving photo would read as a glitch.
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    active?.scrollIntoView?.({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [index, reducedMotion])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      End: items.length - 1,
      Home: 0,
    }
    const next = moves[event.key]
    if (next === undefined) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const clamped = Math.min(Math.max(next, 0), items.length - 1)
    goTo(clamped)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[clamped]?.focus()
  }

  const defaultProps = {
    'aria-label': labels.thumbnails,
    children: items.map((item, itemIndex) => {
      const value: LightboxThumbnailContextValue = {
        index: itemIndex,
        isActive: itemIndex === index,
        item,
      }
      return (
        <LightboxThumbnailContext.Provider key={item.id} value={value}>
          {children ? children(value) : <LightboxThumbnail />}
        </LightboxThumbnailContext.Provider>
      )
    }),
    className: cn(
      'flex max-w-full [scrollbar-width:none] gap-1.5 overflow-x-auto snap-x',
      '[&::-webkit-scrollbar]:hidden',
      className
    ),
    'data-slot': 'media-lightbox-thumbnails',
    onKeyDown: handleKeyDown,
    role: 'tablist' as const,
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: [listRef, ref ?? null],
    render,
  })
}

export type LightboxThumbnailProps = useRender.ComponentProps<'button'>

/** A single thumbnail tab; identity comes from `LightboxThumbnails` via context. */
export function LightboxThumbnail({
  children,
  className,
  render,
  ...props
}: LightboxThumbnailProps): React.ReactElement {
  const { index: itemIndex, isActive, item } = useLightboxThumbnail()
  const { appearance, labels } = useLightboxConfig()
  const { goTo, itemCount } = useLightboxState()

  // A thumbnail-sized file first: this strip draws into a box a few dozen
  // pixels wide, where decoding a wallpaper costs millions of pixels for
  // thousands of pixels of result.
  const appearanceFor = appearance?.[item.id]
  const src =
    resolveThumbSrc(item, appearanceFor) ?? item.poster ?? resolveMediaSrc(item, appearanceFor)

  const defaultProps = {
    'aria-controls': `a63-media-lightbox-slide-${item.id}`,
    'aria-label': `${item.title} — ${labels.position(itemIndex, itemCount)}`,
    'aria-selected': isActive,
    children:
      children ??
      (src ? (
        <img
          alt=""
          className="size-full object-cover"
          decoding="async"
          draggable={false}
          loading="lazy"
          src={src}
        />
      ) : null),
    className,
    ...(isActive ? { 'data-active': '' } : {}),
    'data-index': itemIndex,
    'data-slot': 'media-lightbox-thumbnail',
    id: `a63-media-lightbox-thumb-${item.id}`,
    onClick: () => {
      goTo(itemIndex)
    },
    role: 'tab' as const,
    tabIndex: isActive ? 0 : -1,
    type: 'button' as const,
  }

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  })
}
