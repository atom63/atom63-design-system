import { useEffect, useState } from 'react'

/**
 * Tailwind's `sm` breakpoint (`--breakpoint-sm: 40rem` in `@atom63/styles`),
 * in pixels — the point below which the thumbnail strip stops being worth
 * its keep (see `useMinWidth`'s call site in the preset).
 */
export const SM_BREAKPOINT_PX = 640

/**
 * Whether the viewport is at least `minWidthPx` wide, kept live across
 * resizes.
 *
 * There is no shared `useMediaQuery` in this package, so this mirrors the
 * convention every other responsive hook here already uses (`useIsMobile`,
 * `sidebar.tsx`'s inlined copy of it): read `window.innerWidth` against a
 * breakpoint rather than a `MediaQueryListEvent`'s own `matches`, and use
 * `matchMedia` only as the signal that a resize crossed the line worth
 * re-checking. SSR-safe — a server has no viewport, so it reports `true`
 * (the common case, and the one that avoids a strip flashing in on hydration
 * for the far more common desktop reader).
 */
export function useMinWidth(minWidthPx: number): boolean {
  const [aboveMinWidth, setAboveMinWidth] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= minWidthPx
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mediaQuery = window.matchMedia(`(min-width: ${minWidthPx}px)`)
    const handleChange = () => {
      setAboveMinWidth(window.innerWidth >= minWidthPx)
    }
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [minWidthPx])

  return aboveMinWidth
}
