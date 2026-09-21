import type * as React from 'react'

import { cn } from '../../lib/cn'

const ANIMATED_CHECK_STYLE = `
.a63-AnimatedCheck {
  display: inline-block;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
}

.a63-AnimatedCheck[data-animate='true'] .a63-AnimatedCheck-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: a63-animated-check-draw 300ms ease-out forwards;
}

@keyframes a63-animated-check-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .a63-AnimatedCheck[data-animate='true'] .a63-AnimatedCheck-path {
    animation: none;
    stroke-dashoffset: 0;
  }
}
`

export interface AnimatedCheckProps extends Omit<
  React.ComponentProps<'svg'>,
  'animate' | 'children'
> {
  /** Draw the checkmark in on mount. Suppressed when the user prefers reduced motion. */
  animate?: boolean
}

export function AnimatedCheck({
  animate = true,
  className,
  ...props
}: AnimatedCheckProps): React.ReactElement {
  return (
    <svg
      {...props}
      aria-hidden
      className={cn('a63-AnimatedCheck', className)}
      data-animate={animate ? 'true' : undefined}
      data-slot="animated-check"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <style>{ANIMATED_CHECK_STYLE}</style>
      <path
        className="a63-AnimatedCheck-path"
        d="M4 12l5 5L20 6"
        data-slot="animated-check-path"
        pathLength={1}
      />
    </svg>
  )
}
