'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { animate, motion, usePresence } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type * as React from 'react'
import { cn } from '../../../lib/cn'
import { MEDIA_FADE, MEDIA_SPRING } from '../motion'
import {
  clearOriginMorph,
  guessedMediaBox,
  measureOriginMorph,
  paintOriginMorph,
} from '../origin-morph'
import { hasMedia, resolveMediaSrc, resolveThumbSrc, SlideMedia } from '../slide-media'
import { useMediaAspect } from '../use-media-aspect'
import { MEDIA_VIEW_TRANSITION_NAME, MORPH_TARGET_ATTRIBUTE } from '../view-transition'
import { useLightboxConfig, useLightboxSlide, useLightboxState } from './context'
import { useLightboxRefs } from './refs'
import { useLightboxZoomOptionsRegistry, type LightboxZoomOptions } from './zoom-options'

/**
 * Grows the media out of `origin` and shrinks it back on the way out.
 *
 * This is a measured FLIP rather than a `layoutId` shared layout: the lightbox
 * is `position: fixed` inside a portal, and motion's projection maths resolves
 * against DOM ancestry, so a shared layout pairs the two elements but never
 * animates between them.
 *
 * A single spring drives a 0→1 progress that `paintOriginMorph` turns into a
 * transform, a clip, and a corner radius at once. Three properties on one
 * driver stay in lockstep by construction, and a spring can be re-targeted
 * mid-flight, so closing something that is still opening reverses from where it
 * actually is.
 */
function useOriginZoom(
  origin: HTMLElement | null | undefined,
  enabled: boolean
): React.RefObject<HTMLDivElement | null> {
  const mediaRef = useRef<HTMLDivElement>(null)
  const [isPresent, safeToRemove] = usePresence()

  useLayoutEffect(() => {
    const media = mediaRef.current
    if (!media || !enabled) {
      return
    }

    // The media box is sized by an image that may not have decoded yet, so the
    // first measurement can legitimately be zero. Hold it hidden until it has a
    // box worth animating from.
    media.style.opacity = '0'
    let cancelled = false

    const startZoom = (): boolean => {
      if (cancelled) {
        return true
      }
      // Measure the untransformed box. React re-runs layout effects in
      // StrictMode, and a second measurement taken through the transform the
      // first pass applied reports the thumbnail's box, which collapses the
      // zoom to a no-op.
      clearOriginMorph(media)
      const measured = media.getBoundingClientRect()
      const box = measured.width > 0 ? measured : origin ? guessedMediaBox(media, origin) : null
      if (!box) {
        return false
      }

      const morph = measureOriginMorph(media, box, origin ?? null)
      media.style.opacity = '1'

      if (morph) {
        media.style.transformOrigin = 'center'
        media.style.willChange = 'transform'
        paintOriginMorph(media, morph, 0)
        void animate(0, 1, {
          ...MEDIA_SPRING,
          onComplete: () => {
            clearOriginMorph(media)
          },
          onUpdate: progress => {
            paintOriginMorph(media, morph, progress)
          },
        })
      } else {
        void animate(media, { opacity: [0, 1] }, MEDIA_FADE)
      }
      return true
    }

    // Without a ResizeObserver there is no way to know when the media has a box,
    // so settle for the cross-fade rather than leaving it invisible.
    if (startZoom() || typeof ResizeObserver === 'undefined') {
      if (media.style.opacity === '0') {
        media.style.opacity = '1'
        void animate(media, { opacity: [0, 1] }, MEDIA_FADE)
      }
      return () => {
        cancelled = true
      }
    }

    const observer = new ResizeObserver(() => {
      if (startZoom()) {
        observer.disconnect()
      }
    })
    observer.observe(media)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [enabled, origin])

  useEffect(() => {
    const media = mediaRef.current
    if (isPresent) {
      return
    }
    if (!media || !enabled) {
      safeToRemove?.()
      return
    }

    // Re-measure rather than reuse the opening geometry: the gallery may have
    // been swiped, the viewport resized, or the image finally decoded since.
    clearOriginMorph(media)
    const box = media.getBoundingClientRect()
    const morph = box.width > 0 ? measureOriginMorph(media, box, origin ?? null) : null

    const animation = morph
      ? (() => {
          media.style.transformOrigin = 'center'
          media.style.willChange = 'transform'
          return animate(1, 0, {
            ...MEDIA_SPRING,
            onUpdate: progress => {
              paintOriginMorph(media, morph, progress)
            },
          })
        })()
      : animate(media, { opacity: 0 }, MEDIA_FADE)

    void animation.then(() => {
      safeToRemove?.()
    })
  }, [enabled, isPresent, origin, safeToRemove])

  return mediaRef
}

export type LightboxFrameProps = useRender.ComponentProps<'div'>

/**
 * The morph target: the box that grows out of the thumbnail (or the browser's
 * own View Transition) and back. Only the active slide's frame ever
 * registers into the shared `mediaRef` slot or claims the morph attributes —
 * the others sit inert, waiting their turn.
 */
export function LightboxFrame({
  children,
  className,
  ref,
  render,
  ...props
}: LightboxFrameProps): React.ReactElement {
  const slide = useLightboxSlide()
  if (slide === null) {
    throw new Error('Lightbox.Frame must be rendered inside Lightbox.Slide.')
  }
  const { isActive, isNear, item } = slide
  const { appearance, origin, reducedMotion, transition } = useLightboxConfig()
  const { isZoomed } = useLightboxState()
  const { mediaRef } = useLightboxRefs()
  const viewTransition = transition === 'view-transition'

  // The morph measures the media in viewport coordinates. Every slide's
  // frame occupies the same box in the stack regardless of which index is
  // active, so — unlike the scrolling track this replaced — that box is
  // already right by the time this measures it; there is no jump to park
  // first and no ordering to race.

  // Every slide the preload neighbourhood mounts, not only the active one.
  // Gated on `isActive` instead, a slide had no shape until it became the
  // active one and then gained one — two different sizing paths for the same
  // element, so it visibly resized mid-crossfade while both slides were on
  // screen at full opacity. `isNear` is already the set whose media is
  // mounted, so this starts no fetch that was not happening anyway.
  const itemThumb = isNear ? resolveThumbSrc(item, appearance?.[item.id]) : undefined
  const itemSrc = isNear ? resolveMediaSrc(item, appearance?.[item.id]) : undefined
  // The shape of this slide's photo, known before it arrives.
  const activeAspect = useMediaAspect(itemThumb, itemSrc)
  // The photo's own resolution: the honest ceiling on how large it should
  // ever be drawn. Upscaling past it only magnifies compression.
  // Held back until the frame has settled on a size: a frame that resizes under
  // a running morph drags the photo away from where the morph is aiming it.
  const frameRef = useOriginZoom(
    origin,
    !reducedMotion && !viewTransition && (!itemThumb || activeAspect !== undefined)
  )
  const slideAspect = activeAspect

  const defaultProps = {
    children,
    className: cn(
      'relative flex max-h-full min-h-0',
      'items-center justify-center',
      // `overflow-hidden` is mechanism, not decoration: it is what clips the
      // media to the frame during the morph. The corner radius that clip
      // follows is the caller's — `origin-morph` reads it off this element, so
      // it has to land here via `className` rather than on a child.
      //
      // It lifts while zoomed. The frame is photo-shaped, so clipping to it
      // would mean magnifying a picture inside a fixed window: the part of the
      // photo you zoomed towards leaves the frame and simply disappears.
      // Released, the enlarged photo runs to the edges of the track, which
      // clips at the viewport — which is the whole screen, and the only
      // boundary a zoom should answer to.
      !isZoomed && 'overflow-hidden',
      // With the shape known the frame can size itself from the slide, which
      // is the only definite box in the chain. Without it the frame has to
      // wait for the photo, and a placeholder inside would be sizing itself
      // against a box that is sizing itself against the placeholder.
      //
      // Both of the slide's axes, via its size container: width follows the
      // slide, and the ceiling on that width is the width this aspect ratio
      // would reach at the slide's full height. Whichever runs out first
      // wins, which is exactly `object-contain`'s rule — but applied to the
      // frame, so the frame *is* the picture rather than a box the picture is
      // letterboxed inside. That matters beyond neatness: everything the
      // frame owns is addressed to its own edges. The morph flies the
      // thumbnail to them, the corner radius is drawn on them, and the
      // full-bleed close area begins outside them — so a frame larger than
      // the photo overshoots the morph, rounds corners nobody can see, and
      // covers taps meant for the close area with bands that look exactly
      // like backdrop.
      slideAspect !== undefined &&
        'h-auto max-h-[100cqh] w-[100cqw] max-w-[calc(100cqh*var(--a63-lightbox-aspect))]',
      className
    ),
    // Only carried by the active slide, and only when the browser itself owns
    // the transition: a second element sharing the morph's name would strand
    // the browser's snapshot pairing (see `view-transition.ts`'s "name
    // isolation").
    ...(isActive && viewTransition ? { [MORPH_TARGET_ATTRIBUTE]: '' } : {}),
    'data-slot': 'media-lightbox-frame',
    style: {
      ...(slideAspect === undefined
        ? {}
        : { '--a63-lightbox-aspect': slideAspect, aspectRatio: slideAspect }),
      ...(isActive && viewTransition ? { viewTransitionName: MEDIA_VIEW_TRANSITION_NAME } : {}),
    } as CSSProperties,
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: [isActive ? mediaRef : null, isActive ? frameRef : null, ref ?? null],
    render: render ?? (
      <motion.div
        animate={reducedMotion && isActive ? { opacity: 1 } : undefined}
        initial={reducedMotion && isActive ? { opacity: 0 } : undefined}
        transition={MEDIA_FADE}
      />
    ),
  })
}

export type LightboxZoomProps = LightboxZoomOptions & useRender.ComponentProps<'div'>

/**
 * A dedicated layer for the zoom transform: `Frame` above it is the morph
 * target and the FLIP target, and three engines cannot share one `transform`.
 *
 * Its zoom options (`minZoom`, `maxZoom`, ...) are published up to `Content`,
 * which owns the single `useMediaZoom` call the whole gallery shares. Omitting
 * `Zoom` entirely is legal — zoom simply never engages, exactly as omitting
 * `Slides` leaves the swipe gesture unattached.
 */
export function LightboxZoom({
  children,
  className,
  doubleTapScale,
  keyboardPanDistance,
  maxZoom,
  minZoom,
  onZoomChange,
  ref,
  render,
  scrollToZoom,
  wheelSensitivity,
  zoomStep,
  ...props
}: LightboxZoomProps): React.ReactElement {
  const slide = useLightboxSlide()
  if (slide === null) {
    throw new Error('Lightbox.Zoom must be rendered inside Lightbox.Slide.')
  }
  const { isActive, isNear, item } = slide
  const { appearance } = useLightboxConfig()
  const { zoomRef } = useLightboxRefs()
  const registerOptions = useLightboxZoomOptionsRegistry()

  // Same gate as `Frame`'s: every mounted slide resolves its own shape, so a
  // slide does not change size at the moment it becomes the active one.
  const itemThumb = isNear ? resolveThumbSrc(item, appearance?.[item.id]) : undefined
  const itemSrc = isNear ? resolveMediaSrc(item, appearance?.[item.id]) : undefined
  const slideAspect = useMediaAspect(itemThumb, itemSrc)

  useEffect(() => {
    if (!isActive) {
      return
    }
    registerOptions({
      doubleTapScale,
      keyboardPanDistance,
      maxZoom,
      minZoom,
      onZoomChange,
      scrollToZoom,
      wheelSensitivity,
      zoomStep,
    })
    return () => {
      registerOptions(null)
    }
  }, [
    doubleTapScale,
    isActive,
    keyboardPanDistance,
    maxZoom,
    minZoom,
    onZoomChange,
    registerOptions,
    scrollToZoom,
    wheelSensitivity,
    zoomStep,
  ])

  const defaultProps = {
    children,
    className: cn(
      'relative',
      isActive && 'transform-gpu will-change-transform',
      // Mirrors `Frame`'s own `h-full`: without an explicit size, an
      // absolutely positioned `filled` photo (see `Media`) has nothing to
      // size itself against and collapses this box to zero height.
      slideAspect !== undefined && 'size-full',
      className
    ),
    'data-slot': 'media-lightbox-zoom',
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    ref: [isActive ? zoomRef : null, ref ?? null],
    render,
  })
}

/**
 * The media itself: an image, a video, or whatever the caller handed over.
 * Mounted only for slides in the preload neighbourhood — a 2880x1920 photo is
 * ~22MB decoded, so a long gallery cannot keep the whole track resident.
 */
export function LightboxMedia(): React.ReactElement | null {
  const slide = useLightboxSlide()
  if (slide === null) {
    throw new Error('Lightbox.Media must be rendered inside Lightbox.Slide.')
  }
  const { isActive, isNear, item } = slide
  const { appearance } = useLightboxConfig()

  const src = resolveMediaSrc(item, appearance?.[item.id])
  const thumbSrc = resolveThumbSrc(item, appearance?.[item.id])
  // Every mounted slide, not only the active one. `filled` switches the
  // media between filling its frame and sizing itself, and a slide that
  // flipped between the two at the moment it became active resized on
  // screen mid-crossfade, while both it and the slide it replaced were at
  // full opacity. Slides outside the preload neighbourhood still probe
  // nothing — they render no media at all.
  const aspect = useMediaAspect(isNear ? thumbSrc : undefined, isNear ? src : undefined)
  const filled = aspect !== undefined

  if (!isNear || !hasMedia(item, src)) {
    return null
  }

  return <SlideMedia active={isActive} filled={filled} item={item} src={src} thumbSrc={thumbSrc} />
}
