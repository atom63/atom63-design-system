'use client'

import { marqueeContract } from '@atom63/ui-foundation'
import { Pause, Play } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import type { ComponentPropsWithoutRef, CSSProperties, ReactElement, ReactNode } from 'react'
import { useState } from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'

export type MarqueeProps = ComponentPropsWithoutRef<'div'> & {
  className?: string
  reverse?: boolean
  /** Pause while the strip is hovered or holds focus. Defaults to true. */
  pauseOnHover?: boolean
  /**
   * Pause the strip from outside. Passing it (true or false) hands pausing to
   * you: the built-in pause toggle is not rendered, so give users your own
   * control (WCAG 2.2.2).
   */
  paused?: boolean
  /** Accessible name of the built-in pause toggle. Defaults to "Pause". */
  pauseLabel?: string
  children: ReactNode
  vertical?: boolean
  repeat?: number
  gap?: string
}

/* Marquee — an infinitely scrolling strip. Faithful port of prod @atom63/ui
   Marquee: `repeat` duplicate tracks scroll via the a63-marquee keyframes;
   `reverse`, `paused`, and `pauseOnHover` drive animation state; `vertical`
   switches axis; `gap` feeds the --gap custom property.
   WCAG 2.2.2 (Pause, Stop, Hide): moving content needs a way to pause it, so the
   strip pauses on hover and focus by default and renders a pause toggle unless
   the caller controls `paused`. Under reduced motion it does not move at all. */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  paused,
  pauseLabel = 'Pause',
  style,
  children,
  vertical = false,
  repeat = marqueeContract.defaultRepeat,
  gap = marqueeContract.defaultGap,
  ...props
}: MarqueeProps): ReactElement {
  const [userPaused, setUserPaused] = useState(false)
  const isPaused = paused ?? userPaused
  // Under reduced motion the strip stops and becomes a scrollable region
  // (marquee.css), so keyboard users need to be able to focus it to scroll.
  // A group, not a region landmark, so several marquees on one page do not
  // add duplicate landmarks; pass aria-label to name each one.
  const reducedMotion = Boolean(useReducedMotion())
  const scrollRegion = reducedMotion
    ? { 'aria-label': 'Scrolling content', role: 'group', tabIndex: 0 }
    : undefined
  return (
    <div
      className={cn('a63-Marquee', className)}
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      data-slot="marquee"
      {...scrollRegion}
      {...props}
      style={{ '--gap': gap, ...style } as CSSProperties}
    >
      {Array.from({ length: repeat }, (_, trackIndex) => (
        <div
          // Index keys are safe here: the duplicated tracks are static and never reorder.
          aria-hidden={trackIndex > 0 || undefined}
          key={`marquee-track-${trackIndex}`}
          className="a63-Marquee-track"
          data-orientation={vertical ? 'vertical' : 'horizontal'}
          data-paused={isPaused ? '' : undefined}
          data-pause-on-hover={pauseOnHover ? '' : undefined}
          data-reverse={reverse ? '' : undefined}
          data-slot="marquee-track"
          inert={trackIndex > 0 ? true : undefined}
        >
          {children}
        </div>
      ))}
      {paused === undefined && !reducedMotion ? (
        <Button
          aria-label={pauseLabel}
          aria-pressed={userPaused}
          className="a63-Marquee-control"
          onClick={() => setUserPaused(value => !value)}
          size="icon-sm"
          variant="secondary"
        >
          {userPaused ? <Play aria-hidden /> : <Pause aria-hidden />}
        </Button>
      ) : null}
    </div>
  )
}
