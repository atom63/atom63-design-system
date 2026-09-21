'use client'

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import * as React from 'react'

import { cn } from '../../lib/cn'

/*
 * Carousel — an embla-carousel-react-backed slider. Faithful port of prod
 * @atom63/ui carousel.tsx: same parts (Carousel/CarouselContent/CarouselItem/
 * CarouselPrevious/CarouselNext), the same `CarouselApi` type, the same context +
 * `useCarousel` hook, and the same props (opts/plugins/orientation/setApi +
 * cursorIndicator + ArrowLeft/ArrowRight keyboard nav + canScroll gating). Chrome
 * is restyled to a63 tokens via a63-Carousel-* classes (the nav buttons + cursor
 * overlay read the OVERLAY surface + --a63-overlay-shadow). See carousel.css.
 *
 * `cursorIndicator` faithfully ports prod's pointer-following motion overlay: a
 * round prev/next affordance that tracks the pointer inside the viewport, dims
 * when it can't navigate in that direction, and scrolls on click (using
 * lucide-react + motion, both already ui-react deps). The static nav arrows use
 * inline SVG. Cursor navigation uses click (not pointerdown) so Embla drag/swipe
 * is not interrupted at gesture start.
 */

export type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

export type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
  /** Show a pointer-following cursor indicator for prev/next on hover. */
  cursorIndicator?: boolean
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

export function useCarousel(): CarouselContextProps {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

export function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  cursorIndicator = false,
  ...props
}: React.ComponentProps<'div'> & CarouselProps): React.ReactElement {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  // Cursor indicator state
  const containerRef = React.useRef<HTMLDivElement>(null)
  const pointerOriginRef = React.useRef<{ x: number; y: number } | null>(null)
  const pointerMovedRef = React.useRef(false)
  const [cursorActive, setCursorActive] = React.useState(false)
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 })
  const [cursorSide, setCursorSide] = React.useState<'prev' | 'next'>('next')
  const reducedMotion = Boolean(useReducedMotion())

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!(api && setApi)) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)

    return () => {
      api.off('reInit', onSelect)
      api.off('select', onSelect)
    }
  }, [api, onSelect])

  // Cursor indicator handlers
  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!(cursorIndicator && containerRef.current)) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      setCursorPos({ x, y })
      setCursorSide(x < centerX ? 'prev' : 'next')
      setCursorActive(true)

      const origin = pointerOriginRef.current
      if (origin) {
        const dx = e.clientX - origin.x
        const dy = e.clientY - origin.y
        if (dx * dx + dy * dy > 36) {
          pointerMovedRef.current = true
        }
      }
    },
    [cursorIndicator]
  )

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!cursorIndicator) return
      pointerOriginRef.current = { x: e.clientX, y: e.clientY }
      pointerMovedRef.current = false
    },
    [cursorIndicator]
  )

  const handlePointerLeave = React.useCallback(() => {
    if (!cursorIndicator) return
    setCursorActive(false)
    pointerOriginRef.current = null
  }, [cursorIndicator])

  const handleCursorClick = React.useCallback(() => {
    if (!cursorIndicator) return
    // Ignore click synthesized after a drag/swipe — Embla owns that gesture.
    if (pointerMovedRef.current) {
      pointerMovedRef.current = false
      pointerOriginRef.current = null
      return
    }
    pointerOriginRef.current = null
    if (cursorSide === 'prev' && canScrollPrev) {
      scrollPrev()
    } else if (cursorSide === 'next' && canScrollNext) {
      scrollNext()
    }
  }, [cursorIndicator, cursorSide, canScrollPrev, canScrollNext, scrollPrev, scrollNext])

  // Determine if cursor can navigate in the current direction
  const canNavigate = cursorSide === 'prev' ? canScrollPrev : canScrollNext

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        aria-roledescription="carousel"
        className={cn(
          'a63-Carousel',
          cursorIndicator && 'a63-Carousel--cursor-indicator',
          cursorIndicator && cursorActive && 'a63-Carousel--cursor-hidden',
          className
        )}
        data-orientation={orientation}
        data-slot="carousel"
        onClick={cursorIndicator ? handleCursorClick : undefined}
        onKeyDownCapture={handleKeyDown}
        onPointerDown={cursorIndicator ? handlePointerDown : undefined}
        onPointerLeave={cursorIndicator ? handlePointerLeave : undefined}
        onPointerMove={cursorIndicator ? handlePointerMove : undefined}
        ref={containerRef}
        role="region"
        {...props}
      >
        {children}

        {/* Cursor indicator overlay */}
        <AnimatePresence>
          {cursorIndicator && cursorActive && (
            <motion.div
              animate={{ scale: 1, opacity: canNavigate ? 1 : 0.5 }}
              className="a63-Carousel-cursor"
              data-disabled={canNavigate ? undefined : ''}
              data-side={cursorSide}
              data-slot="carousel-cursor"
              exit={{ scale: 0, opacity: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              style={{
                left: cursorPos.x - 20,
                top: cursorPos.y - 20,
              }}
              transition={
                reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }
              }
            >
              {cursorSide === 'prev' ? (
                <ArrowLeft aria-hidden className="a63-Carousel-cursor-icon" />
              ) : (
                <ArrowRight aria-hidden className="a63-Carousel-cursor-icon" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div className="a63-Carousel-viewport" data-slot="carousel-content" ref={carouselRef}>
      <div
        className={cn('a63-Carousel-track', className)}
        data-orientation={orientation}
        {...props}
      />
    </div>
  )
}

export function CarouselItem({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  const { orientation } = useCarousel()

  return (
    <div
      aria-roledescription="slide"
      className={cn('a63-Carousel-item', className)}
      data-orientation={orientation}
      data-slot="carousel-item"
      role="group"
      {...props}
    />
  )
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path
        d="M15 6 9 12l6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  )
}

export function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<'button'>): React.ReactElement {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <button
      className={cn('a63-Carousel-nav', className)}
      data-direction="prev"
      data-orientation={orientation}
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      type="button"
      {...props}
    >
      <ArrowLeftIcon />
      <span className="a63-Carousel-sr-only">Previous slide</span>
    </button>
  )
}

export function CarouselNext({
  className,
  ...props
}: React.ComponentProps<'button'>): React.ReactElement {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <button
      className={cn('a63-Carousel-nav', className)}
      data-direction="next"
      data-orientation={orientation}
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      type="button"
      {...props}
    >
      <ArrowRightIcon />
      <span className="a63-Carousel-sr-only">Next slide</span>
    </button>
  )
}
