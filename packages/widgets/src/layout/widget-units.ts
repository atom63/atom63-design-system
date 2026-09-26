import type { WidgetSize } from '../types'

/** Span of a widget in widget units (one unit = one cell of the host grid). */
export interface WidgetUnitSpan {
  cols: number
  rows: number
}

/**
 * Single source of truth for widget geometry.
 *
 * Hosts map a widget unit onto their own grid:
 * - os63 desktop: 1 widget unit = 2 desktop cells
 * - atom63.io web: 1 widget unit = 1 CSS grid column
 */
export const WIDGET_UNIT_SPAN: Record<WidgetSize, WidgetUnitSpan> = {
  small: { cols: 1, rows: 1 },
  medium: { cols: 2, rows: 1 },
  large: { cols: 2, rows: 2 },
}

/**
 * Internal authoring coordinate width for one widget unit.
 *
 * Existing widget values are authored on this coordinate system. Presentation
 * scale is measured against WIDGET_CANONICAL_CELL_PX instead.
 */
export const WIDGET_UNIT_BASE_PX = 256

/** OS63-sized 100% presentation width of one widget cell, in CSS px. */
export const WIDGET_CANONICAL_CELL_PX = 188

/** Largest supported proportional presentation scale above the canonical cell. */
export const WIDGET_MAX_PRESENTATION_SCALE = 1.375

/**
 * Minimum font size per floor bucket on the canonical presentation canvas.
 * Whole-canvas presentation scaling preserves these proportions in smaller
 * hosts rather than reflowing around a fixed physical type floor.
 *
 * Intent roles (chrome / label / body / title / …) live in `WIDGET_TYPE_RAMP`
 * and map onto these buckets via `WIDGET_TYPE_ROLE_FLOOR`.
 *
 * `display` is deliberately unfloored: a 40px figure at 24px is still legible,
 * and flooring it would distort the composition it anchors.
 */
export const WIDGET_TYPE_FLOOR = {
  label: 11,
  body: 12,
  display: 0,
} as const

/** Floor buckets used by the type ramp. Prefer `WidgetTypeRampRole` for authoring. */
export type WidgetTypeFloorRole = keyof typeof WIDGET_TYPE_FLOOR

/** @deprecated Use `WidgetTypeFloorRole` or `WidgetTypeRampRole`. */
export type WidgetTypeRole = WidgetTypeFloorRole

// No accessor function: consumers index `WIDGET_UNIT_SPAN[size]` directly.
// A one-line wrapper would add public surface that enforces nothing.
