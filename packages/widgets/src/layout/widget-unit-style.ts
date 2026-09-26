import type { CSSProperties } from 'react'

/**
 * Inline-style helpers for authoring widget content in DESIGN px against
 * `--widget-u`, the design unit `widgetSizeStyle()` publishes on every tile.
 *
 * These live here because the package owns `--widget-u`; a host defining its
 * own readers for a package-owned custom property is the inversion this fixes.
 * Prefer them over Tailwind arbitrary classes: dynamic class strings are never
 * seen by the Tailwind scanner.
 *
 * ## What design px does NOT do
 *
 * It does not make a value "scale with the tile" where a fixed rem or px value
 * would not. `WidgetViewport` wraps every widget in a transform-scaled canvas
 * (`widgetPresentationStyle`), and a transform scales the whole composition —
 * fixed rem, fixed px and design-unit lengths alike. A `2.4rem` box measured
 * 38.4px at the canonical cell and 52.7px at a 1.372 host, exactly like a
 * `wu()` length would.
 *
 * So the reason to author in design px is CONSISTENCY, not scaling: the type
 * ramp, the insets and the gaps all live on the same 256 canvas, so one dial
 * moves the whole composition and no value has to be converted by hand. Do not
 * justify a conversion as a rendering fix — it will not change the render, and
 * a changeset that claims it did is wrong.
 */

/**
 * Length from a design-px value.
 * Use in inline `style` (not Tailwind class strings — scanners never see dynamic classes).
 *
 * Falls back to `1px` — design px == CSS px — when no host published a unit.
 * Without the fallback the `calc()` is INVALID and the browser drops the whole
 * declaration, so a widget in an unpublishing host loses every padding, gap and
 * font size at once and renders as unstyled text. That is a silent, total
 * collapse that types, tests and lint cannot see. Degrading to design px keeps
 * the widget legible; hosts that publish a cell-derived unit still override it.
 *
 * @example style={{ padding: wu(16), gap: wu(12) }}
 */
export function wu(designPx: number): string {
  return `calc(${designPx} * var(--widget-u, 1px))`
}

/**
 * Proportional length with optional a11y floor / ceiling in CSS px.
 */
export function wuClamp(designPx: number, minPx?: number, maxPx?: number): string {
  const mid = wu(designPx)
  if (minPx != null && maxPx != null) {
    return `clamp(${minPx}px, ${mid}, ${maxPx}px)`
  }
  if (minPx != null) {
    return `max(${minPx}px, ${mid})`
  }
  if (maxPx != null) {
    return `min(${mid}, ${maxPx}px)`
  }
  return mid
}

type Style = CSSProperties

/**
 * Inline-style helpers for design-px space / type / size.
 *
 * Prefer these over Tailwind arbitrary classes — dynamic class strings are not
 * detected by the Tailwind scanner.
 */
export const wuStyle = {
  p: (n: number): Style => ({ padding: wu(n) }),
  px: (n: number): Style => ({ paddingInline: wu(n) }),
  py: (n: number): Style => ({ paddingBlock: wu(n) }),
  pt: (n: number): Style => ({ paddingTop: wu(n) }),
  pb: (n: number): Style => ({ paddingBottom: wu(n) }),
  gap: (n: number): Style => ({ gap: wu(n) }),
  gapX: (n: number): Style => ({ columnGap: wu(n) }),
  gapY: (n: number): Style => ({ rowGap: wu(n) }),
  m: (n: number): Style => ({ margin: wu(n) }),
  mt: (n: number): Style => ({ marginTop: wu(n) }),
  mb: (n: number): Style => ({ marginBottom: wu(n) }),
  ml: (n: number): Style => ({ marginLeft: wu(n) }),
  mr: (n: number): Style => ({ marginRight: wu(n) }),
  mx: (n: number): Style => ({ marginInline: wu(n) }),
  my: (n: number): Style => ({ marginBlock: wu(n) }),
  size: (n: number): Style => ({ width: wu(n), height: wu(n) }),
  h: (n: number): Style => ({ height: wu(n) }),
  w: (n: number): Style => ({ width: wu(n) }),
  text: (n: number): Style => ({ fontSize: wu(n) }),
  textMin: (n: number, minPx: number): Style => ({
    fontSize: wuClamp(n, minPx),
  }),
  rounded: (n: number): Style => ({ borderRadius: wu(n) }),
} as const

/** Merge style objects (later wins). */
export function wuMerge(...parts: Array<Style | undefined | null | false>): Style {
  const merged: Style = {}
  for (const part of parts) {
    if (part) Object.assign(merged, part)
  }
  return merged
}
