import type * as React from 'react'

import { cn } from '../../lib/cn'

const SPINNER_STYLE = `
@keyframes a63-animated-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

.a63-Spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  animation: a63-animated-spinner-spin var(--duration-slower, 1s) linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .a63-Spinner {
    animation: none;
  }
}
`

export function Spinner({ className, ...props }: React.ComponentProps<'svg'>): React.ReactElement {
  return (
    <svg
      aria-label="Loading"
      className={cn('a63-Spinner', className)}
      data-slot="spinner"
      fill="none"
      role="status"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <style>{SPINNER_STYLE}</style>
      <circle cx="12" cy="12" opacity="0.25" r="10" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  )
}
