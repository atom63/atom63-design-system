'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { motion } from 'motion/react'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import type * as React from 'react'
import { cn } from '../../../lib/cn'
import { arrowIndexDelta, isRtlTrack } from '../direction'
import { BACKDROP_IN, BACKDROP_OUT } from '../motion'
import { lockBodyScroll } from '../scroll-lock'
import { useMediaZoom } from '../use-media-zoom'
import { usePullToDismiss } from '../use-pull-to-dismiss'
import { useSwipeIntent } from '../use-swipe-intent'
import { whenMediaViewTransitionSettles } from '../view-transition'
import { useLightboxConfig, useLightboxState } from './context'
import { useLightboxRefs } from './refs'
import { LightboxZoomOptionsRegistryProvider, type LightboxZoomOptions } from './zoom-options'
import { useLightboxZoomRegistry } from './zoom-registry'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]), input, select, textarea'

export type LightboxContentProps = useRender.ComponentProps<'div'>

/**
 * Hosts the modal dialog: focus trap and restore, body scroll lock, the
 * global keydown map, and the zoom/pull-to-dismiss gestures. Everything
 * cosmetic comes in via `className` from the caller; this only keeps the
 * mechanism styling that makes the overlay fill the viewport.
 */
export function LightboxContent({
  children,
  className,
  ref,
  render,
  ...props
}: LightboxContentProps): React.ReactElement {
  const { rootRef, backdropRef, stageRef, trackRef, zoomRef } = useLightboxRefs()
  const { items, labels, reducedMotion, transition } = useLightboxConfig()
  const { close, goTo, index } = useLightboxState()
  const registerZoom = useLightboxZoomRegistry()

  const item = items[index]
  const position = labels.position(index, items.length)
  const viewTransition = transition === 'view-transition'

  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // `Zoom` is a descendant of `Content` (inside `Slide`), so it cannot pass its
  // options as props to the single `useMediaZoom` call below — it publishes
  // them up through `LightboxZoomOptionsRegistryProvider` instead. `null`
  // means no `Zoom` has registered, so no overrides are passed and the hook
  // falls back to its own defaults.
  const [zoomOptions, setZoomOptions] = useState<LightboxZoomOptions | null>(null)

  const { handleKey, isZoomed, zoomIn, zoomOut } = useMediaZoom({
    enabled: true,
    index,
    reducedMotion,
    trackRef,
    zoomRef,
    ...zoomOptions,
  })

  // Registers the zoom state back into Root so parts outside Content (e.g. a
  // Zoom control) can read `isZoomed` / `zoomIn` / `zoomOut` from context.
  useEffect(() => {
    registerZoom({ isZoomed, zoomIn, zoomOut })
  }, [registerZoom, isZoomed, zoomIn, zoomOut])

  // A drag on zoomed media is a pan, not a dismissal.
  usePullToDismiss({
    backdropRef,
    enabled: !isZoomed,
    onDismiss: close,
    reducedMotion,
    rootRef,
    stageRef,
    trackRef,
  })

  // A drag on zoomed media is a pan, not a page turn. The stack itself never
  // moves during the drag (spec §2.4) — this only decides the direction and
  // hands it to the same `goTo` an arrow key or a thumbnail click would use.
  useSwipeIntent({
    enabled: !isZoomed,
    onIntent: delta => {
      goTo(index + delta)
    },
    rootRef,
    stageRef,
  })

  // Focus moves into the lightbox on open and returns to the trigger on close.
  // Wait until the morph has released the thumbnail: restoring focus in the
  // same frame `scale`s it via `focus-within`, and the closing snapshot aims
  // at ~1.04×, then the tile's rounded clip shears off the extra.
  //
  // The dialog itself takes that focus, not its first control. Two reasons.
  // A screen reader entering here should hear the dialog's own name and role
  // before anything else, which is what lands it at the top rather than
  // part-way down on a button (the APG's dialog pattern). And a preset that
  // idles its chrome away — this repo's does — would otherwise leave a
  // genuinely focused control faded to invisible, since nothing ever blurs
  // that first button for someone who opens the lightbox and just looks.
  // `tabIndex={-1}` keeps the container reachable this way without adding a
  // tab stop; `FOCUSABLE_SELECTOR` excludes it for the same reason.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    rootRef.current?.focus({ preventScroll: true })

    return () => {
      const trigger = restoreFocusRef.current
      const restore = () => {
        trigger?.focus({ preventScroll: true })
      }
      if (document.documentElement.classList.contains('a63-media-lightbox-vt')) {
        void whenMediaViewTransitionSettles().then(restore)
        return
      }
      restore()
    }
  }, [rootRef])

  // Held past the overlay's own life when a trackpad dismisses it: the coast
  // that follows the swipe would otherwise scroll the page it uncovers.
  useEffect(() => lockBodyScroll(), [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Modified combos belong to the browser — notably page zoom, which WCAG
      // 1.4.4 requires to keep working while a dialog is open.
      if (!event.ctrlKey && !event.metaKey && !event.altKey && handleKey(event.key)) {
        event.preventDefault()
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        // One layer at a time. A viewer who has zoomed in and reaches for
        // Escape means "give me the whole picture back" far more often than
        // "throw the gallery away" — and closing outright costs them their
        // place in the gallery too, while `0` is the only other way back to
        // fit and nothing advertises it.
        if (isZoomed) {
          handleKey('0')
          return
        }
        close()
        return
      }
      if (!isZoomed) {
        // Mirrored in a right-to-left gallery: "right" only means "onward"
        // where the reading order says so.
        const delta = arrowIndexDelta(
          event.key,
          trackRef.current ? isRtlTrack(trackRef.current) : false
        )
        if (delta !== undefined) {
          event.preventDefault()
          goTo(index + delta)
          return
        }
      }
      if (event.key === 'Home' && !isZoomed) {
        event.preventDefault()
        goTo(0)
        return
      }
      if (event.key === 'End' && !isZoomed) {
        event.preventDefault()
        goTo(items.length - 1)
        return
      }
      if (event.key !== 'Tab') {
        return
      }

      const focusable = [
        ...(rootRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []),
      ]
      if (focusable.length === 0) {
        return
      }
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) {
        return
      }
      // The dialog itself holds focus right after opening, and it is not in
      // `focusable` — it is `tabIndex={-1}` precisely so it never becomes a
      // tab stop. Without this branch a backwards `Tab` from that state
      // falls through to the browser and walks straight out of the dialog,
      // because neither "focus is on `first`" nor "focus is on `last`" is
      // true yet. Forwards is handled for symmetry: the browser would reach
      // `first` on its own from here, but only because the container happens
      // to precede it in DOM order.
      if (document.activeElement === rootRef.current) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus({ preventScroll: true })
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus({ preventScroll: true })
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus({ preventScroll: true })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close, goTo, handleKey, index, isZoomed, items.length, rootRef, trackRef])

  const defaultProps = {
    'aria-label': `${item.title} — ${position}`,
    'aria-modal': 'true' as const,
    children: (
      <LightboxZoomOptionsRegistryProvider value={setZoomOptions}>
        {children}
      </LightboxZoomOptionsRegistryProvider>
    ),
    className: cn('fixed inset-0 z-50 flex flex-col', className),
    'data-open': '',
    'data-pulling': 'false',
    'data-slot': 'media-lightbox',
    'data-transition': viewTransition ? 'view-transition' : 'flip',
    'data-zoomed': isZoomed ? 'true' : 'false',
    role: 'dialog',
    style: {
      '--a63-media-lightbox-media-h': '100%',
    } as CSSProperties,
    // Programmatically focusable on open, but never a tab stop of its own.
    tabIndex: -1,
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: [rootRef, ref ?? null],
    render,
  })
}

export type LightboxBackdropProps = useRender.ComponentProps<'div'>

/** The dimmed scrim behind the media. Pressing it closes the lightbox. */
export function LightboxBackdrop({
  className,
  ref,
  render,
  ...props
}: LightboxBackdropProps): React.ReactElement {
  const { backdropRef } = useLightboxRefs()
  const { close } = useLightboxState()
  const { transition } = useLightboxConfig()
  const viewTransition = transition === 'view-transition'

  const defaultProps = {
    // Opaque, no backdrop-filter: the page behind can stop painting, which
    // a translucent blur would forbid. It portals next to `Content`, so it
    // needs `Content`'s fixed layer too: `absolute` left it under any
    // positioned page chrome with a z-index, such as a sticky header.
    className: cn('fixed inset-0 z-50 bg-black', className),
    'data-slot': 'media-lightbox-backdrop',
    onClick: close,
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: [backdropRef, ref ?? null],
    render: render ?? (
      <motion.div
        // `startViewTransition` snapshots the whole document, so when the
        // browser owns the morph, a Motion-driven fade here would run on top
        // of the snapshot's own animation. Standing down avoids the double
        // animation.
        animate={viewTransition ? undefined : { opacity: 1 }}
        exit={viewTransition ? undefined : { opacity: 0, transition: BACKDROP_OUT }}
        initial={viewTransition ? undefined : { opacity: 0 }}
        transition={BACKDROP_IN}
      />
    ),
  })
}

export type LightboxStatusProps = useRender.ComponentProps<'div'>

/** Announces the active item to screen readers; swiping is a silent change without it. */
export function LightboxStatus({
  className,
  ref,
  render,
  ...props
}: LightboxStatusProps): React.ReactElement {
  const { items, labels } = useLightboxConfig()
  const { index } = useLightboxState()
  const item = items[index]
  const position = labels.position(index, items.length)

  const defaultProps = {
    'aria-atomic': true,
    'aria-live': 'polite' as const,
    children: `${item.title}, ${position}`,
    className: cn('sr-only', className),
    'data-slot': 'media-lightbox-status',
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: ref ?? null,
    render,
  })
}
