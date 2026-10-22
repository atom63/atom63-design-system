import { type AnimatedCheckVariant, animatedCheckContract } from '@atom63/ui-foundation'
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
  /**
   * `animated` draws the checkmark in on mount (suppressed when the user prefers
   * reduced motion); `static` shows it at once. Defaults to `animated`.
   */
  variant?: AnimatedCheckVariant
  /** @deprecated Use `variant="static"` instead of `animate={false}`. */
  animate?: boolean
}

export function AnimatedCheck({
  variant,
  animate,
  className,
  ...props
}: AnimatedCheckProps): React.ReactElement {
  const resolvedVariant =
    variant ?? (animate === false ? 'static' : animatedCheckContract.defaultVariant)
  return (
    <svg
      {...props}
      aria-hidden
      className={cn('a63-AnimatedCheck', className)}
      data-animate={resolvedVariant === 'animated' ? 'true' : undefined}
      data-slot="animated-check"
      data-variant={resolvedVariant}
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
