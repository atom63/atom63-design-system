import type { CSSProperties } from 'react'
import type { WidgetSize } from '../types'
import { wu } from './widget-unit-style'

/**
 * Shared body / face inset in design-px (256 authoring canvas).
 *
 * Calibrated so the OS63 188 cell resolves ≈ prior Tailwind `px-3` / `px-4`:
 * - 16 × 188/256 ≈ 11.75px (was `px-3`)
 * - 22 × 188/256 ≈ 16.1px (was `px-4`)
 *
 * Prefer `widgetInsetStyle` over local `wuStyle.p(…)` or `px-3` / `p-3.5`.
 */
export const WIDGET_BODY_INSET = {
  small: 16,
  medium: 22,
  large: 22,
} as const satisfies Record<WidgetSize, number>

/**
 * Shared stack gap in design-px between body children.
 * ≈ Tailwind `gap-2` / `gap-3` at the OS63 cell.
 */
export const WIDGET_BODY_GAP = {
  small: 11,
  medium: 11,
  large: 16,
} as const satisfies Record<WidgetSize, number>

export type WidgetInsetMode =
  /** Full-face chrome-less body — padding on all sides. */
  | 'face'
  /**
   * Horizontal + bottom only. Used under `WidgetCardHeader`, and for
   * chrome-less faces with intentional top bleed (e.g. Behance ribbons).
   */
  | 'body'

export interface WidgetInsetStyleOptions {
  /** Include `gap` from `WIDGET_BODY_GAP`. Default true. */
  gap?: boolean
}

/** Design-px inset for a footprint. */
export function widgetInsetPx(size: WidgetSize): number {
  return WIDGET_BODY_INSET[size]
}

/**
 * Inline padding (+ optional gap) from the shared inset ramp.
 *
 * @example
 * // Chrome-less Behance / Instagram / Location / Weather
 * style={widgetInsetStyle(size, 'face')}
 *
 * // Under WidgetCardHeader (GitHub, Profile, …)
 * style={widgetInsetStyle(size, 'body')}
 */
export function widgetInsetStyle(
  size: WidgetSize,
  mode: WidgetInsetMode = 'face',
  options?: WidgetInsetStyleOptions
): CSSProperties {
  const inset = WIDGET_BODY_INSET[size]
  const includeGap = options?.gap !== false
  const style: CSSProperties = {
    paddingInline: wu(inset),
    paddingBottom: wu(inset),
  }

  if (mode === 'face') {
    style.paddingTop = wu(inset)
  }

  if (includeGap) {
    style.gap = wu(WIDGET_BODY_GAP[size])
  }

  return style
}
