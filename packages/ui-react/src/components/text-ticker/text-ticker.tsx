import {
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { cn } from '../../lib/cn'

export interface TextTickerProps extends Omit<ComponentProps<'span'>, 'children'> {
  animationType?: 'marquee'
  /**
   * When true and the text overflows, the marquee runs continuously
   * instead of only on hover/focus.
   */
  autoPlay?: boolean
  children: ReactNode
  marqueeDelay?: number
  marqueeSpeed?: number
}

/* An overflow-aware text ticker. Without `animationType="marquee"` it simply
   truncates. In marquee mode it measures its content against the container and,
   when the text overflows, reveals a continuously-scrolling copy on hover/focus
   (or always when `autoPlay`). Measurement + animation logic is a faithful port
   of the production component; only the styling class names + tokens changed. */
export function TextTicker({
  children,
  className,
  animationType,
  autoPlay = false,
  marqueeDelay = 0,
  marqueeSpeed = 24,
  style,
  ...props
}: TextTickerProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const measureOverflow = useCallback(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!(container && measure)) {
      return
    }

    const nextIsOverflowing = measure.scrollWidth > container.clientWidth + 1
    setIsOverflowing(current => (current === nextIsOverflowing ? current : nextIsOverflowing))
  }, [])

  useEffect(() => {
    if (animationType !== 'marquee') {
      return
    }

    measureOverflow()

    const container = containerRef.current
    const measure = measureRef.current
    if (!container) {
      return
    }

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureOverflow)
      return () => {
        window.removeEventListener('resize', measureOverflow)
      }
    }

    const resizeObserver = new ResizeObserver(measureOverflow)
    resizeObserver.observe(container)
    if (measure) {
      resizeObserver.observe(measure)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [animationType, measureOverflow])

  if (animationType !== 'marquee') {
    return (
      <span
        className={cn('a63-TextTicker', className)}
        data-slot="text-ticker"
        data-static=""
        style={style}
        {...props}
      >
        {children}
      </span>
    )
  }

  const isAutoPlaying = autoPlay && isOverflowing

  return (
    <span
      ref={containerRef}
      className={cn('a63-TextTicker', 'a63-TextTicker--marquee', className)}
      data-autoplay={isAutoPlaying ? '' : undefined}
      data-overflowing={isOverflowing ? '' : undefined}
      data-slot="text-ticker"
      {...props}
      style={
        {
          '--a63-text-ticker-gap': '1.5rem',
          '--a63-text-ticker-delay': `${Math.max(0, marqueeDelay)}ms`,
          '--a63-text-ticker-duration': `${Math.max(1, marqueeSpeed)}s`,
          ...style,
        } as CSSProperties
      }
    >
      <span aria-hidden="true" className="a63-TextTicker-measure" ref={measureRef}>
        {children}
      </span>
      <span className="a63-TextTicker-content" data-slot="text-ticker-content">
        {children}
      </span>
      {isOverflowing ? (
        <span className="a63-TextTicker-marqueeLayer" data-slot="text-ticker-marquee">
          <span aria-hidden="true" className="a63-TextTicker-marqueeTrack">
            <span className="a63-TextTicker-marqueeCopy">{children}</span>
            <span className="a63-TextTicker-marqueeCopy">{children}</span>
          </span>
        </span>
      ) : null}
    </span>
  )
}
