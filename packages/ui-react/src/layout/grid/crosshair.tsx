import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

/**
 * Four-point sparkle at a rail / crossbar junction (Firecrawl-style).
 * Decorative — parent should set `aria-hidden`.
 */
export function GridCrosshair({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<'svg'>, 'children' | 'viewBox'>) {
  return (
    <svg
      className={cn(
        'size-3 text-[color:var(--a63-grid-crosshair-color,var(--input,var(--a63-border-subtle)))]',
        className
      )}
      fill="currentColor"
      overflow="visible"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/*
        Classic 4-point sparkle (concave sides, tips on the axes). Larger
        viewBox + softer control points so it reads as a star, not a plus.
      */}
      <path d="M12 0C12.8 7.2 7.2 12.8 0 12C7.2 12.8 12.8 16.8 12 24C11.2 16.8 16.8 12.8 24 12C16.8 11.2 12.8 7.2 12 0Z" />
    </svg>
  )
}
