'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type * as React from 'react'
import { cn } from '../../../lib/cn'
import { isRtlTrack } from '../direction'
import { trackTransform } from '../track-physics'
import { useSlideTrack } from '../use-slide-track'
import {
  LightboxSlideContext,
  useLightboxConfig,
  useLightboxSlide,
  useLightboxState,
} from './context'
import { useLightboxRefs } from './refs'
import { useLightboxThumbnailsPresence } from './thumbnails-registry'
import type { LightboxSlide as LightboxSlideValue } from './context'

export type LightboxViewportProps = useRender.ComponentProps<'div'>

/** The frame the track sits inside of. */
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
 * A track, like a native pager: the slides sit side by side in one strip, a gap
 * apart, and a page turn moves that strip. The strip is the only thing that
 * moves, with a single `translate3d`, so a turn costs the compositor one layer
 * and re-rasters nothing on the way. See `useSlideTrack` for the gestures and
 * springs.
 *
 * This element is the clipping frame and the carousel's accessible group; the
 * strip inside it is plain layout. The gap is `--a63-media-lightbox-gap`
 * (`--a63-space-4` by default), and in a right-to-left gallery the strip runs
 * the other way.
 *
 * A turn used to be a crossfade in a stack of slides, chosen when a full-width
 * `backdrop-filter` over the moving photo made sliding judder. That blur is
 * gone, and nothing blurred sits over the strip while it moves: the only
 * blurred surfaces are the small on-media controls, and they drop the blur for
 * as long as the root carries `data-paging`.
 */
export function LightboxSlides({
  children,
  className,
  ref,
  render,
  ...props
}: LightboxSlidesProps): React.ReactElement {
  const { rootRef, trackRef } = useLightboxRefs()
  const { goTo, index, isZoomed, itemCount } = useLightboxState()
  const { items, labels, preload, reducedMotion } = useLightboxConfig()
  const stripRef = useRef<HTMLDivElement>(null)

  // Decode only the active slide on the opening frame; neighbours wait a paint
  // so open is not paying for three wallpaper bitmaps at once.
  const [livePreload, setLivePreload] = useState(0)
  const [trackDirection, setTrackDirection] = useState<'ltr' | 'rtl'>('ltr')

  const { span } = useSlideTrack({
    // A drag on zoomed media is a pan, not a page turn.
    enabled: !isZoomed,
    goTo,
    index,
    itemCount,
    mountRadius: livePreload,
    reducedMotion,
    rootRef,
    stripRef,
    trackRef,
  })

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

  const strip = (
    <div
      className={cn(
        'flex h-full w-full',
        'gap-[var(--a63-media-lightbox-gap,var(--a63-space-4))]',
        // The transform is physical; this flips it for a strip that runs
        // right to left, so the position arithmetic stays in reading order.
        '[--a63-media-lightbox-track-sign:1] rtl:[--a63-media-lightbox-track-sign:-1]'
      )}
      data-slot="media-lightbox-strip"
      ref={stripRef}
      // The resting position only. While the strip moves, `useSlideTrack`
      // writes this property itself. React writes it again only when the index
      // changes, and the track puts it back before that frame paints.
      style={{ transform: trackTransform(index) }}
    >
      {items.map((item, slideIndex) => {
        const isActive = slideIndex === index
        // Decoded bitmaps are the expensive part of a gallery: a 2880x1920
        // frame is ~22MB resident, so only the preload neighbourhood, plus
        // whatever a moving strip is passing over, stays mounted.
        const isNear =
          isActive ||
          Math.abs(slideIndex - index) <= livePreload ||
          (span !== null && slideIndex >= span[0] && slideIndex <= span[1])
        const slide: LightboxSlideValue = { isActive, isNear, item, slideIndex }
        return (
          <LightboxSlideContext.Provider key={item.id} value={slide}>
            {children(slide)}
          </LightboxSlideContext.Provider>
        )
      })}
    </div>
  )

  const defaultProps = {
    'aria-label': labels.gallery,
    'aria-roledescription': labels.carousel,
    children: strip,
    // `touch-none`: the browser must not start a pan of its own under a drag
    // that is paging, pulling or pinching the photo. Each of those is handled
    // here, and a browser pan would cancel the pointer mid-gesture.
    className: cn('relative h-full w-full touch-none overflow-hidden', className),
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
 * A single slide's wrapper: identity, `inert` and roving `role`/`aria-*` are
 * all derived from `LightboxSlideContext`. It is exactly one slide wide, so the
 * track's position arithmetic can count in slides. What goes inside is the
 * caller's.
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
  const { items, labels } = useLightboxConfig()
  const hasThumbnails = useLightboxThumbnailsPresence()
  // With a strip each slide is the panel its thumbnail tab names; without one
  // it is a standalone carousel slide.
  const showThumbnails = hasThumbnails && items.length > 1

  const defaultProps = {
    'aria-label': showThumbnails
      ? undefined
      : `${item.title} — ${labels.position(slideIndex, items.length)}`,
    'aria-labelledby': showThumbnails ? `a63-media-lightbox-thumb-${item.id}` : undefined,
    'aria-roledescription': labels.slide,
    children,
    className: cn(
      'relative flex h-full w-full shrink-0 items-center justify-center',
      // A size container, so the frame can size itself against the slide in
      // *both* axes at once. Pinning one axis and letting the aspect ratio
      // drive the other only fits one orientation: pin the height and a photo
      // wider than the screen overflows and gets clamped back to the screen's
      // shape, pin the width and a taller one does the same. `cqw`/`cqh` give
      // the frame both of the slide's dimensions, so it can take the smaller
      // of the two fits and land on the photo's shape either way.
      '[container-type:size]',
      // Only the active slide is ever hit-tested. A neighbour a drag has half
      // revealed is still only a neighbour; a press on it lands on the track,
      // which is where catching a moving strip belongs.
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
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: ref ?? null,
    render,
  })
}
