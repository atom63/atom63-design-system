'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type * as React from 'react'
import { cn } from '../../../lib/cn'
import { isRtlTrack } from '../direction'
import { LIGHTBOX_TIMING } from '../timing'
import {
  LightboxSlideContext,
  useLightboxConfig,
  useLightboxSlide,
  useLightboxState,
} from './context'
import { useLightboxRefs } from './refs'
import { useStageTransition } from './stage-transition'
import { useLightboxThumbnailsPresence } from './thumbnails-registry'
import type { LightboxSlide as LightboxSlideValue } from './context'

export type LightboxViewportProps = useRender.ComponentProps<'div'>

/** The clipping frame the stack sits inside of. */
export function LightboxViewport({
  className,
  ref,
  render,
  ...props
}: LightboxViewportProps): React.ReactElement {
  const { stageRef } = useLightboxRefs()

  const defaultProps = {
    className: cn('relative z-10 min-h-0 flex-1', className),
    'data-slot': 'media-lightbox-viewport',
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: [stageRef, ref ?? null],
    render,
  })
}

export type LightboxSlidesProps = Omit<useRender.ComponentProps<'div'>, 'children'> & {
  /** The number and identity of slides comes from `items`, not from markup the caller lays out. */
  children: (slide: LightboxSlideValue) => ReactNode
}

/**
 * A stack, not a track: every mounted slide occupies the same box, and a page
 * turn is nothing but an index change — `opacity` is what selects which one
 * is showing (see `stage-transition.ts`), and there is no position for a
 * compositor to re-raster on every frame of a turn.
 *
 * This gives up what real scroll-snapping used to buy for free — 1:1 finger
 * tracking, the platform's own momentum, rubber-banding, mid-fling
 * interruption — a trade made deliberately (see
 * `docs/superpowers/specs/2026-09-12-lightbox-crossfade-stage.md` §2.4) to
 * remove the jank a moving photo cost the compositor, not to optimise it.
 */
export function LightboxSlides({
  children,
  className,
  ref,
  render,
  ...props
}: LightboxSlidesProps): React.ReactElement {
  const { trackRef } = useLightboxRefs()
  const { index } = useLightboxState()
  const { items, labels, preload, reducedMotion, timing } = useLightboxConfig()

  // Decode only the active slide on the opening frame; neighbours wait a paint
  // so open is not paying for three wallpaper bitmaps at once.
  const [livePreload, setLivePreload] = useState(0)
  const [trackDirection, setTrackDirection] = useState<'ltr' | 'rtl'>('ltr')
  const { outgoingIndex } = useStageTransition({ index, reducedMotion, timing })

  useEffect(() => {
    if (preload <= 0) {
      return
    }
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        setLivePreload(preload)
      })
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [preload])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (track) {
      setTrackDirection(isRtlTrack(track) ? 'rtl' : 'ltr')
    }
  }, [trackRef])

  const defaultProps = {
    'aria-label': labels.gallery,
    'aria-roledescription': labels.carousel,
    children: items.map((item, slideIndex) => {
      const isActive = slideIndex === index
      // Decoded bitmaps are the expensive part of a gallery: a 2880x1920
      // frame is ~22MB resident, so only the preload neighbourhood — plus
      // whichever slide is still fading out of a crossfade — stays mounted.
      const isNear =
        isActive || slideIndex === outgoingIndex || Math.abs(slideIndex - index) <= livePreload
      const slide: LightboxSlideValue = { isActive, isNear, item, slideIndex }
      return (
        <LightboxSlideContext.Provider key={item.id} value={slide}>
          {children(slide)}
        </LightboxSlideContext.Provider>
      )
    }),
    className: cn('relative h-full w-full overflow-hidden', className),
    'data-active-index': index,
    'data-direction': trackDirection,
    'data-slot': 'media-lightbox-track',
    role: 'group' as const,
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: [trackRef, ref ?? null],
    render,
  })
}

export type LightboxSlideProps = useRender.ComponentProps<'div'>

/**
 * A single slide's wrapper: identity, `inert`, roving `role`/`aria-*`, and
 * the crossfade opacity are all derived from `LightboxSlideContext`. What
 * goes inside is the caller's.
 */
export function LightboxSlide({
  children,
  className,
  ref,
  render,
  ...props
}: LightboxSlideProps): React.ReactElement {
  const slide = useLightboxSlide()
  if (slide === null) {
    throw new Error('Lightbox.Slide must be rendered inside Lightbox.Slides.')
  }
  const { isActive, item, slideIndex } = slide
  const { items, labels, reducedMotion, timing } = useLightboxConfig()
  const hasThumbnails = useLightboxThumbnailsPresence()
  // With a strip each slide is the panel its thumbnail tab names; without one
  // it is a standalone carousel slide.
  const showThumbnails = hasThumbnails && items.length > 1
  const { vtDurationMs, vtEasing } = LIGHTBOX_TIMING[timing]

  const style: CSSProperties = {
    opacity: isActive ? 1 : 0,
    // Reduced motion switches instantly: no transition property means the
    // opacity value above lands on the very frame it changes.
    ...(reducedMotion
      ? {}
      : {
          transitionDuration: `${vtDurationMs}ms`,
          transitionProperty: 'opacity',
          transitionTimingFunction: vtEasing,
        }),
  }

  const defaultProps = {
    'aria-label': showThumbnails
      ? undefined
      : `${item.title} — ${labels.position(slideIndex, items.length)}`,
    'aria-labelledby': showThumbnails ? `a63-media-lightbox-thumb-${item.id}` : undefined,
    'aria-roledescription': labels.slide,
    children,
    className: cn(
      'absolute inset-0 flex h-full w-full items-center justify-center',
      // A size container, so the frame can size itself against the slide in
      // *both* axes at once. Pinning one axis and letting the aspect ratio
      // drive the other only fits one orientation: pin the height and a photo
      // wider than the screen overflows and gets clamped back to the screen's
      // shape, pin the width and a taller one does the same. `cqw`/`cqh` give
      // the frame both of the slide's dimensions, so it can take the smaller
      // of the two fits and land on the photo's shape either way.
      '[container-type:size]',
      // Only the active slide should ever be hit-tested: a slide fading out
      // (or one that never left `opacity: 0`) still occupies the same box.
      !isActive && 'pointer-events-none',
      className
    ),
    ...(isActive ? { 'data-active': '' } : {}),
    'data-index': slideIndex,
    'data-slot': 'media-lightbox-slide',
    id: `a63-media-lightbox-slide-${item.id}`,
    // `inert` also drops the slide out of the tab order and out of
    // find-in-page, which `aria-hidden` alone does not.
    inert: !isActive,
    role: showThumbnails ? ('tabpanel' as const) : ('group' as const),
    style,
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: ref ?? null,
    render,
  })
}
