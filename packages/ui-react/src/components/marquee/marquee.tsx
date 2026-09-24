'use client'

import { marqueeContract } from '@atom63/ui-foundation'
import { useReducedMotion } from 'motion/react'
import type { ComponentPropsWithoutRef, CSSProperties, ReactElement, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type MarqueeProps = ComponentPropsWithoutRef<'div'> & {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  paused?: boolean
  children: ReactNode
  vertical?: boolean
  repeat?: number
  gap?: string
}

/* Marquee — an infinitely scrolling strip. Faithful port of prod @atom63/ui
   Marquee: `repeat` duplicate tracks scroll via the a63-marquee keyframes;
   `reverse`, `paused`, and `pauseOnHover` drive animation state; `vertical`
   switches axis; `gap` feeds the --gap custom property. */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  paused = false,
  style,
  children,
  vertical = false,
  repeat = marqueeContract.defaultRepeat,
  gap = marqueeContract.defaultGap,
  ...props
}: MarqueeProps): ReactElement {
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
          data-paused={paused ? '' : undefined}
          data-pause-on-hover={pauseOnHover ? '' : undefined}
          data-reverse={reverse ? '' : undefined}
          data-slot="marquee-track"
          inert={trackIndex > 0 ? true : undefined}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
