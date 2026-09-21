import { animate } from 'motion/react'
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { ZOOM_STEP_SPRING } from './motion'

const MIN_SCALE = 1
/** Used only when the media's natural size is unknown. */
const FALLBACK_MAX_SCALE = 4
/** Button and keyboard steps multiply rather than add, like every photos app. */
const ZOOM_STEP = 2
/** Content pixels an arrow key moves the media while zoomed. */
const KEYBOARD_PAN = 50
/** What a double-tap jumps to, and what a second one comes back from. */
const DOUBLE_TAP_SCALE = 2.5
/** Below this the media is treated as un-zoomed, so swiping and pulling resume. */
const ZOOM_EPSILON = 0.01

interface Transform {
  scale: number
  x: number
  y: number
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 }

function baselineTransform(scale: number): Transform {
  return { scale, x: 0, y: 0 }
}

interface MediaZoomOptions {
  enabled: boolean
  reducedMotion: boolean
  /** Resets the zoom whenever the gallery moves to another slide. */
  index: number
  zoomRef: RefObject<HTMLDivElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  /** Fit to frame is 1; there is no point going below it. */
  minZoom?: number
  /** Omit to derive from naturalWidth, with 4 as a fallback. */
  maxZoom?: number
  /** Button and keyboard steps multiply rather than add, like every photos app. */
  zoomStep?: number
  doubleTapScale?: number
  keyboardPanDistance?: number
  wheelSensitivity?: number
  /** Plain wheel should not hijack page scroll unless a caller opts in. */
  scrollToZoom?: boolean
  onZoomChange?: (zoom: number) => void
}

export interface MediaZoomResult {
  isZoomed: boolean
  /** Steps in from fit, anchored on the centre. */
  zoomIn: () => void
  /** Steps back toward fit, anchored on the centre. */
  zoomOut: () => void
  /** `+` / `-` / `0` and, while zoomed, the arrow keys. Reports what it used. */
  handleKey: (key: string) => boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Pinch on a trackpad or touch screen, double-tap, or ctrl + scroll to zoom at
 * the pointer; drag to pan.
 *
 * Zooming is exclusive with the gallery's own gestures: while the media is
 * larger than its frame, a drag pans it instead of turning the page, so the
 * track's horizontal scrolling and the pull-to-dismiss gesture stand down until
 * it is back to fit.
 */
export function useMediaZoom({
  enabled,
  reducedMotion,
  index,
  zoomRef,
  trackRef,
  minZoom,
  maxZoom,
  zoomStep,
  doubleTapScale,
  keyboardPanDistance,
  wheelSensitivity,
  scrollToZoom = false,
  onZoomChange,
}: MediaZoomOptions): MediaZoomResult {
  const [isZoomed, setIsZoomed] = useState(false)
  const transformRef = useRef<Transform>(IDENTITY)
  const applyRef = useRef<(next: Transform, animated?: boolean) => void>(() => {})
  const keyRef = useRef<(key: string) => boolean>(() => false)
  const zoomInRef = useRef<() => void>(() => {})
  const zoomOutRef = useRef<() => void>(() => {})
  const zoomChangeRef = useRef(onZoomChange)
  zoomChangeRef.current = onZoomChange

  const handleKey = useCallback((key: string) => keyRef.current(key), [])
  const zoomIn = useCallback(() => {
    zoomInRef.current()
  }, [])
  const zoomOut = useCallback(() => {
    zoomOutRef.current()
  }, [])

  // `index` is a dependency because the zoom layer belongs to the active slide:
  // without it this effect keeps a closure over the element the gallery has
  // already scrolled past, and the zoom lands on media nobody is looking at.
  useEffect(() => {
    const zoom = zoomRef.current
    const track = trackRef.current
    if (!enabled || !zoom || !track) {
      return
    }

    const resolvedMinZoom = minZoom ?? MIN_SCALE
    const resolvedZoomStep = zoomStep ?? ZOOM_STEP
    const resolvedDoubleTapScale = doubleTapScale ?? DOUBLE_TAP_SCALE
    const resolvedKeyboardPanDistance = keyboardPanDistance ?? KEYBOARD_PAN
    const resolvedWheelSensitivity = wheelSensitivity ?? 100
    const baseline = baselineTransform(resolvedMinZoom)
    const previousTransform = transformRef.current

    // A zoom belongs to the image it was made on.
    transformRef.current = baseline

    let frameW = 0
    let frameH = 0
    let naturalW = 0
    /** Untransformed centre in the viewport; pan is added on top. */
    let originX = 0
    let originY = 0
    let zoomed = previousTransform.scale > resolvedMinZoom + ZOOM_EPSILON
    let gestureRaf = 0
    let wheelMul = 1
    let wheelX = 0
    let wheelY = 0
    let pinchPending: { scale: number; x: number; y: number } | null = null
    let stepAnimation: { stop: () => void } | null = null
    /**
     * What is currently on screen, which during a step is behind what the
     * transform *is*. Interrupting a step picks up from here so the media does
     * not jump to the last target before starting for the new one.
     */
    let drawn: Transform = previousTransform

    const draw = (next: Transform) => {
      if (drawn.scale !== next.scale) {
        zoomChangeRef.current?.(next.scale)
      }
      const ceiling = maxScale()
      const progress =
        ceiling > resolvedMinZoom ? (next.scale - resolvedMinZoom) / (ceiling - resolvedMinZoom) : 0
      drawn = next
      zoom.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`
      zoom.style.setProperty('--a63-lightbox-zoom-progress', progress.toFixed(3))
    }

    const cacheOrigin = () => {
      const rect = zoom.getBoundingClientRect()
      const current = transformRef.current
      originX = rect.left + rect.width / 2 - current.x
      originY = rect.top + rect.height / 2 - current.y
    }

    const measure = () => {
      frameW = zoom.offsetWidth
      frameH = zoom.offsetHeight
      // The full photo, not the small stand-in beside it: the zoom ceiling is
      // the pixels that actually exist, and the stand-in has almost none.
      const img = zoom.querySelector<HTMLImageElement>('[data-slot="media-lightbox-image"]')
      if (img && img.naturalWidth > 0) {
        naturalW = img.naturalWidth
      }
      cacheOrigin()
    }
    measure()

    /**
     * Past the media's own resolution a zoom only magnifies compression, so the
     * ceiling is the pixels that actually exist.
     */
    const maxScale = () => {
      if (typeof maxZoom === 'number') {
        return maxZoom
      }
      if (naturalW > 0 && frameW > 0) {
        return Math.max(naturalW / frameW, resolvedMinZoom + 0.5)
      }
      return FALLBACK_MAX_SCALE
    }

    /** Keeps the media from being dragged clean off its own frame. */
    const limit = (next: Transform): Transform => {
      const overflowX = (frameW * (next.scale - 1)) / 2
      const overflowY = (frameH * (next.scale - 1)) / 2
      return {
        scale: next.scale,
        x: clamp(next.x, -overflowX, overflowX),
        y: clamp(next.y, -overflowY, overflowY),
      }
    }

    const paint = (next: Transform) => {
      transformRef.current = next
      draw(next)
    }

    const syncChrome = (zoomedNow: boolean) => {
      if (zoomedNow === zoomed) {
        return
      }
      zoomed = zoomedNow
      setIsZoomed(zoomedNow)
      zoom.style.cursor = zoomedNow ? 'grab' : ''
      zoom.style.willChange = zoomedNow ? 'transform' : ''
      track.style.overflowX = zoomedNow ? 'hidden' : ''
      track.style.touchAction = zoomedNow ? 'none' : ''
    }

    const apply = (next: Transform, animated = false) => {
      const bounded = limit({ ...next, scale: clamp(next.scale, resolvedMinZoom, maxScale()) })
      syncChrome(bounded.scale > resolvedMinZoom + ZOOM_EPSILON)
      // A live pinch or wheel is already frame-by-frame; only a discrete step
      // has anywhere to travel. Either way the previous step gives up its claim
      // on the transform, so a second press re-aims from where it currently is
      // rather than fighting for the same property.
      stepAnimation?.stop()
      stepAnimation = null
      if (!animated || reducedMotion) {
        paint(bounded)
        return
      }
      // The target becomes the transform immediately; the spring only catches
      // the pixels up. Anything that reads the zoom — the next step, the pan
      // limits, whether the gallery may swipe again — then reads where the
      // media is going rather than an intermediate frame it is passing through.
      const from = drawn
      transformRef.current = bounded
      stepAnimation = animate(0, 1, {
        ...ZOOM_STEP_SPRING,
        onComplete: () => {
          stepAnimation = null
          draw(bounded)
        },
        onUpdate: progress => {
          draw({
            scale: from.scale + (bounded.scale - from.scale) * progress,
            x: from.x + (bounded.x - from.x) * progress,
            y: from.y + (bounded.y - from.y) * progress,
          })
        },
      })
    }
    applyRef.current = apply
    apply(baseline)

    const visualCentre = () => {
      const current = transformRef.current
      return { x: originX + current.x, y: originY + current.y }
    }

    /** Scales around a screen point, keeping whatever is under it in place. */
    const scaleAt = (nextScale: number, clientX: number, clientY: number, animated = false) => {
      const current = transformRef.current
      const target = clamp(nextScale, resolvedMinZoom, maxScale())
      if (target === current.scale) {
        return
      }
      const centre = visualCentre()
      const unitX = (clientX - centre.x) / current.scale
      const unitY = (clientY - centre.y) / current.scale
      apply(
        {
          scale: target,
          x: current.x + unitX * (current.scale - target),
          y: current.y + unitY * (current.scale - target),
        },
        animated
      )
    }

    const flushGesture = () => {
      gestureRaf = 0
      if (pinchPending) {
        const pending = pinchPending
        pinchPending = null
        wheelMul = 1
        scaleAt(pending.scale, pending.x, pending.y)
        return
      }
      if (wheelMul === 1) {
        return
      }
      const mul = wheelMul
      wheelMul = 1
      scaleAt(transformRef.current.scale * mul, wheelX, wheelY)
    }

    const scheduleGesture = () => {
      if (!gestureRaf) {
        gestureRaf = requestAnimationFrame(flushGesture)
      }
    }

    zoomInRef.current = () => {
      const current = transformRef.current
      const c = visualCentre()
      scaleAt(current.scale * resolvedZoomStep, c.x, c.y, true)
    }
    zoomOutRef.current = () => {
      const current = transformRef.current
      if (current.scale <= resolvedMinZoom + ZOOM_EPSILON) {
        return
      }
      const c = visualCentre()
      scaleAt(current.scale / resolvedZoomStep, c.x, c.y, true)
    }

    const handleWheel = (event: WheelEvent) => {
      // A trackpad pinch arrives as ctrl + wheel; a plain wheel is not ours
      // unless the caller explicitly opts into scroll-to-zoom.
      if (!event.ctrlKey && !scrollToZoom) {
        return
      }
      event.preventDefault()
      pinchPending = null
      wheelMul *= Math.exp(-event.deltaY / resolvedWheelSensitivity)
      wheelX = event.clientX
      wheelY = event.clientY
      scheduleGesture()
    }

    const handleDoubleClick = (event: MouseEvent) => {
      event.preventDefault()
      if (transformRef.current.scale > resolvedMinZoom + ZOOM_EPSILON) {
        apply(baseline, true)
        return
      }
      const current = transformRef.current
      const centre = visualCentre()
      const unitX = (event.clientX - centre.x) / current.scale
      const unitY = (event.clientY - centre.y) / current.scale
      apply(
        {
          scale: resolvedDoubleTapScale,
          x: current.x + unitX * (current.scale - resolvedDoubleTapScale),
          y: current.y + unitY * (current.scale - resolvedDoubleTapScale),
        },
        true
      )
    }

    const points = new Map<number, { x: number; y: number }>()
    let pinchDistance = 0
    let pinchScale = 1
    let panning = false
    let panX = 0
    let panY = 0

    const centreOf = () => {
      const all = [...points.values()]
      const sum = all.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
      return { x: sum.x / all.length, y: sum.y / all.length }
    }

    const spread = () => {
      const [a, b] = [...points.values()]
      if (!a || !b) {
        return 0
      }
      return Math.hypot(a.x - b.x, a.y - b.y)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const zoomedNow = transformRef.current.scale > resolvedMinZoom + ZOOM_EPSILON
      // A mouse only ever pans, and only once there is something to pan. Below
      // that the track's own drag owns the pointer.
      if (event.pointerType === 'mouse' && !zoomedNow) {
        return
      }
      if ((event.target as HTMLElement | null)?.closest('[data-a63-no-drag]')) {
        return
      }
      points.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (points.size === 2) {
        pinchDistance = spread()
        pinchScale = transformRef.current.scale
        panning = false
        return
      }
      if (points.size === 1 && zoomedNow) {
        panning = true
        panX = event.clientX
        panY = event.clientY
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!points.has(event.pointerId)) {
        return
      }
      points.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (points.size >= 2) {
        const distance = spread()
        if (pinchDistance > 0 && distance > 0) {
          const centre = centreOf()
          pinchPending = {
            scale: (pinchScale * distance) / pinchDistance,
            x: centre.x,
            y: centre.y,
          }
          wheelMul = 1
          scheduleGesture()
        }
        return
      }
      if (!panning) {
        return
      }
      const current = transformRef.current
      apply({
        scale: current.scale,
        x: current.x + event.clientX - panX,
        y: current.y + event.clientY - panY,
      })
      panX = event.clientX
      panY = event.clientY
    }

    const endPointer = (event: PointerEvent) => {
      points.delete(event.pointerId)
      if (points.size < 2) {
        pinchDistance = 0
      }
      if (points.size === 0) {
        panning = false
      }
    }

    keyRef.current = (key: string) => {
      const current = transformRef.current
      const zoomedNow = current.scale > resolvedMinZoom + ZOOM_EPSILON
      const centre = visualCentre()

      // Unmodified keys only. `⌘+` / `Ctrl+` stay the browser's page zoom, which
      // WCAG 1.4.4 requires to keep working while a dialog is open.
      if (key === '+' || key === '=') {
        scaleAt(current.scale * resolvedZoomStep, centre.x, centre.y, true)
        return true
      }
      if (key === '-' || key === '_') {
        scaleAt(current.scale / resolvedZoomStep, centre.x, centre.y, true)
        return true
      }
      if (key === '0') {
        apply(baseline, true)
        return true
      }
      if (!zoomedNow) {
        return false
      }
      // While zoomed the arrows pan the media; the gallery keeps them at 1x.
      const pan: Record<string, [number, number]> = {
        ArrowDown: [0, -resolvedKeyboardPanDistance],
        ArrowLeft: [resolvedKeyboardPanDistance, 0],
        ArrowRight: [-resolvedKeyboardPanDistance, 0],
        ArrowUp: [0, resolvedKeyboardPanDistance],
      }
      const delta = pan[key]
      if (!delta) {
        return false
      }
      apply({ scale: current.scale, x: current.x + delta[0], y: current.y + delta[1] })
      return true
    }

    // A smaller viewport shrinks the media's own overflow, which would leave an
    // existing pan hanging outside its frame.
    const handleResize = () => {
      measure()
      apply(transformRef.current)
    }
    const handleImageLoad = () => {
      measure()
      apply(transformRef.current)
    }
    const img = zoom.querySelector<HTMLImageElement>('[data-slot="media-lightbox-image"]')
    img?.addEventListener('load', handleImageLoad)
    window.addEventListener('resize', handleResize)

    track.addEventListener('wheel', handleWheel, { passive: false })
    track.addEventListener('dblclick', handleDoubleClick)
    track.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', endPointer, { passive: true })
    window.addEventListener('pointercancel', endPointer, { passive: true })

    return () => {
      applyRef.current = () => {}
      keyRef.current = () => false
      zoomInRef.current = () => {}
      zoomOutRef.current = () => {}
      if (gestureRaf) {
        cancelAnimationFrame(gestureRaf)
      }
      stepAnimation?.stop()
      stepAnimation = null
      window.removeEventListener('resize', handleResize)
      img?.removeEventListener('load', handleImageLoad)
      track.removeEventListener('wheel', handleWheel)
      track.removeEventListener('dblclick', handleDoubleClick)
      track.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', endPointer)
      window.removeEventListener('pointercancel', endPointer)
      track.style.overflowX = ''
      track.style.touchAction = ''
      zoom.style.transform = ''
      zoom.style.cursor = ''
      zoom.style.transition = ''
      zoom.style.willChange = ''
      zoom.style.removeProperty('--a63-lightbox-zoom-progress')
    }
  }, [
    enabled,
    index,
    reducedMotion,
    minZoom,
    maxZoom,
    zoomStep,
    doubleTapScale,
    keyboardPanDistance,
    wheelSensitivity,
    scrollToZoom,
    trackRef,
    zoomRef,
  ])

  return { handleKey, isZoomed, zoomIn, zoomOut }
}
