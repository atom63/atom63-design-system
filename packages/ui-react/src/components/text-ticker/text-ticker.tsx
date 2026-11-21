'use client'

import { type TextTickerVariant, textTickerContract } from '@atom63/ui-foundation'
import { Pause, Play } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
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
import { Button } from '../button'

export interface TextTickerProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** `truncate` ends overflowing text with an ellipsis; `marquee` scrolls it. Defaults to `truncate`. */
  variant?: TextTickerVariant
  /** @deprecated Use `variant="marquee"`. */
  animationType?: 'marquee'
  /**
   * When true and the text overflows, the marquee runs continuously
   * instead of only on hover/focus. It pauses while hovered or focused and
   * renders a pause toggle unless you control `paused` (WCAG 2.2.2).
   */
  autoPlay?: boolean
  /**
   * Pause the autoplaying marquee from outside. Passing it (true or false)
   * hands pausing to you: the built-in pause toggle is not rendered, so give
   * users your own control. Pass it when the ticker sits inside a button or
   * link, where a nested toggle is not allowed.
   */
  paused?: boolean
  /** Accessible name of the built-in pause toggle. Defaults to "Pause". */
  pauseLabel?: string
  children: ReactNode
  marqueeDelay?: number
  marqueeSpeed?: number
}

/* An overflow-aware text ticker. Without `variant="marquee"` it simply
   truncates. In marquee mode it measures its content against the container and,
   when the text overflows, reveals a continuously-scrolling copy on hover/focus
   (or always when `autoPlay`). WCAG 2.2.2 (Pause, Stop, Hide): an autoplaying
   marquee pauses on hover and focus and shows a pause toggle, like Marquee;
   under reduced motion it does not move and shows no toggle. Measurement + animation logic is a faithful port
   of the production component; only the styling class names + tokens changed. */
export function TextTicker({
  children,
  className,
  variant,
  animationType,
  autoPlay = false,
  paused,
  pauseLabel = 'Pause',
  marqueeDelay = 0,
  marqueeSpeed = 24,
  ref,
  style,
  ...props
}: TextTickerProps) {
  const marquee = (variant ?? animationType ?? textTickerContract.defaultVariant) === 'marquee'
  const containerRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const reducedMotion = Boolean(useReducedMotion())

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
    if (!marquee) {
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
  }, [marquee, measureOverflow])

  if (!marquee) {
    return (
      <span
        className={cn('a63-TextTicker', className)}
        data-slot="text-ticker"
        data-variant="truncate"
        data-static=""
        ref={ref}
        style={style}
        {...props}
      >
        {children}
      </span>
    )
  }

  const isAutoPlaying = autoPlay && isOverflowing
  const isPaused = isAutoPlaying && (paused ?? userPaused)
  const showControl = isAutoPlaying && paused === undefined && !reducedMotion

  return (
    <span
      className={cn('a63-TextTicker', 'a63-TextTicker--marquee', className)}
      data-autoplay={isAutoPlaying ? '' : undefined}
      data-control={showControl ? '' : undefined}
      data-overflowing={isOverflowing ? '' : undefined}
      data-paused={isPaused ? '' : undefined}
      data-slot="text-ticker"
      data-variant="marquee"
      {...props}
      ref={ref}
      style={
        {
          '--a63-text-ticker-gap': '1.5rem',
          '--a63-text-ticker-delay': `${Math.max(0, marqueeDelay)}ms`,
          '--a63-text-ticker-duration': `${Math.max(1, marqueeSpeed)}s`,
          ...style,
        } as CSSProperties
      }
    >
      <span className="a63-TextTicker-viewport" ref={containerRef}>
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
      {showControl ? (
        <Button
          aria-label={pauseLabel}
          aria-pressed={userPaused}
          className="a63-TextTicker-control"
          onClick={() => setUserPaused(value => !value)}
          size="icon-xs"
          tone="muted"
          variant="ghost"
        >
          {userPaused ? <Play aria-hidden /> : <Pause aria-hidden />}
        </Button>
      ) : null}
    </span>
  )
}
