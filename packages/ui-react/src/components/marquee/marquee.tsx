import { marqueeContract } from '@atom63/ui-foundation'
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
  return (
    <div
      className={cn('a63-Marquee', className)}
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      data-slot="marquee"
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
