import type { CSSProperties } from 'react'
import type { WidgetSize } from '../types'
import {
  WIDGET_CANONICAL_CELL_PX,
  WIDGET_MAX_PRESENTATION_SCALE,
  WIDGET_UNIT_BASE_PX,
  WIDGET_UNIT_SPAN,
} from './widget-units'

/** Optical density presets — multiply `--widget-scale`. */
export const WIDGET_DENSITY_SCALE = {
  compact: 0.9,
  default: 1,
  comfortable: 1.1,
} as const

export type WidgetDensity = keyof typeof WIDGET_DENSITY_SCALE

export interface WidgetSizeStyleOptions {
  /** Extra multiplier on `--widget-u`. @default 1 */
  scale?: number
  /** Named density preset; multiplies `scale`. @default 'default' */
  density?: WidgetDensity
  /**
   * Floor for `--widget-u` in CSS px. Unset by default — legibility is
   * protected by per-role type floors, not by arresting the unit. A unit
   * floor lets content outgrow its own tile and overflow.
   */
  minScale?: number
}

export type WidgetSizeStyle = CSSProperties & {
  '--a63-control-min-target': string
  '--a63-control-min-target-lg': string
  '--a63-control-min-target-xl': string
  '--widget-cell': string
  '--widget-raw-u': string
  '--widget-rows': string
  '--widget-scale': string
  '--widget-span': string
  '--widget-u': string
}

/** The design-unit properties alone — no span, no grid placement. */
export type WidgetUnitStyle = CSSProperties & {
  '--a63-control-min-target': string
  '--a63-control-min-target-lg': string
  '--a63-control-min-target-xl': string
  '--widget-cell': string
  '--widget-raw-u': string
  '--widget-scale': string
  '--widget-u': string
}

export type WidgetPresentationStyle = CSSProperties & {
  '--a63-control-min-target': string
  '--a63-control-min-target-lg': string
  '--a63-control-min-target-xl': string
  '--widget-interaction-target': string
  '--widget-presentation-scale': string
  '--widget-u': string
}

/**
 * WCAG 2.2 SC 2.5.8 minimum, in physical px — the floor this repo commits to
 * for widget controls (see IMPLEMENTATION.md §8).
 */
const WIDGET_CONTROL_MIN_TARGET_PX = 24

/**
 * Pin the shared control ergonomics floor inside a widget.
 *
 * `@atom63/styles` raises `--a63-control-min-target` to 44px on coarse pointers,
 * and every control recipe floors its RENDERED geometry with it
 * (`--button-height: max(control-height, min-target)`). That lever is right for
 * page chrome and wrong for a widget: the tile is a fixed-proportion canvas, so
 * an inflated control does not gain room, it takes it from the composition —
 * one button would claim a quarter of a 188px cell on any phone.
 *
 * Widgets reach the enhanced 44px target the other way, by expanding the hit
 * area past the visible control with `--widget-interaction-target`, so the
 * geometry can stay proportional at the documented 24px floor. Expressed
 * against the host's presentation scale where there is one, so the floor is 24
 * PHYSICAL px rather than 24 pre-transform px.
 */
function controlTargetStyle(scaleDivisor?: string) {
  const target = scaleDivisor
    ? `calc(${WIDGET_CONTROL_MIN_TARGET_PX}px / ${scaleDivisor})`
    : `${WIDGET_CONTROL_MIN_TARGET_PX}px`

  return {
    '--a63-control-min-target': target,
    '--a63-control-min-target-lg': target,
    '--a63-control-min-target-xl': target,
  }
}

/**
 * `--widget-u` from a cell width. The OS63 cell is the 100% presentation size,
 * while fluid hosts scale the same composition proportionally in either
 * direction, capped at WIDGET_MAX_PRESENTATION_SCALE when growing.
 */
function unitExpression(minScale: number | undefined): string {
  const raw = `calc(var(--widget-cell) / ${WIDGET_UNIT_BASE_PX} * var(--widget-scale, 1))`
  const maximumUnit =
    (WIDGET_CANONICAL_CELL_PX * WIDGET_MAX_PRESENTATION_SCALE) / WIDGET_UNIT_BASE_PX
  return minScale == null
    ? `min(${raw}, ${maximumUnit}px)`
    : `clamp(${minScale}px, ${raw}, ${maximumUnit}px)`
}

function resolveScale(scale: number, density: WidgetDensity): string {
  /** Rounded to avoid IEEE-754 artifacts leaking into CSS (`3 * 1.1` → `3.3000000000000003`). */
  return String(Math.round(scale * WIDGET_DENSITY_SCALE[density] * 1e6) / 1e6)
}

/**
 * Design-unit properties for a host whose cell width is **known in px** — the
 * os63 desktop, whose tiles are laid out on a fixed grid rather than inside a
 * `WidgetGrid` container.
 *
 * `widgetSizeStyle()` cannot serve that host: its cell is `100cqi`-derived, so
 * with no `@container` ancestor it silently resolves against the VIEWPORT, and
 * its `gridColumn`/`gridRow` would fight the desktop's own placement. This
 * returns the unit properties only, so content authored in `wuStyle` renders in
 * both hosts instead of collapsing to dropped `calc()` declarations in one.
 */
export function widgetUnitStyle(
  cellPx: number,
  { density = 'default', minScale, scale = 1 }: WidgetSizeStyleOptions = {}
): WidgetUnitStyle {
  const rawUnit = unitExpression(minScale)

  return {
    ...controlTargetStyle(),
    '--widget-cell': `${cellPx}px`,
    '--widget-raw-u': rawUnit,
    '--widget-scale': resolveScale(scale, density),
    '--widget-u': 'var(--widget-raw-u)',
  }
}

/**
 * Normalize a widget back to its canonical 188px composition, then transform
 * the complete canvas to the host cell. This catches fixed rem/Tailwind values
 * as well as design-unit values, preserving the original spacing and type
 * ratios both above and below the canonical size. A transform is used instead
 * of CSS zoom so the presentation contract behaves consistently in Firefox.
 */
export function widgetPresentationStyle(
  cellPx = WIDGET_CANONICAL_CELL_PX
): WidgetPresentationStyle {
  const presentationScale = String(
    Math.min(cellPx / WIDGET_CANONICAL_CELL_PX, WIDGET_MAX_PRESENTATION_SCALE)
  )

  return {
    ...controlTargetStyle('var(--widget-presentation-scale)'),
    '--widget-interaction-target': 'calc(44px / var(--widget-presentation-scale))',
    '--widget-presentation-scale': presentationScale,
    '--widget-u': 'calc(var(--widget-raw-u) / var(--widget-presentation-scale))',
    // The canvas is a fixed-size box that the transform below scales — it must
    // never be resized by its parent's layout. A host whose viewport element is
    // a flex container (atom63.io's WidgetChrome adds `flex flex-col`) makes
    // this a flex item, and a canvas laid out ABOVE the host box then shrinks to
    // fit it before the transform shrinks it again: at a 165px mobile cell the
    // 188px canvas collapsed to 165, scaled to 144.8, and a 1×1 tile rendered
    // 165×144.8 instead of square. Invisible above the canonical cell, where the
    // canvas is already smaller than its box and there is nothing to shrink.
    flexShrink: 0,
    height:
      'calc((var(--widget-rows) * var(--widget-cell) + (var(--widget-rows) - 1) * var(--widget-gap, 0px)) / var(--widget-presentation-scale))',
    minWidth: 0,
    transform: 'scale(var(--widget-presentation-scale))',
    transformOrigin: 'top left',
    width: 'calc(100cqi / var(--widget-presentation-scale))',
  }
}

/**
 * Width of one widget unit: total inline size minus the gaps *between* the
 * spanned cells, divided by the span. `--widget-gap` is published by WidgetGrid.
 */
const CELL_FORMULA =
  'calc((100cqi - (var(--widget-span) - 1) * var(--widget-gap, 0px)) / var(--widget-span))'

/**
 * Build the geometry and design-unit custom properties for a widget size.
 *
 * The unit divides by the span, so a `medium` tile is twice as wide yet resolves
 * the same `--widget-u` as a `small` — type and padding stay constant across
 * sizes, and only the composition gains room.
 */
export function widgetSizeStyle(
  size: WidgetSize,
  { density = 'default', minScale, scale = 1 }: WidgetSizeStyleOptions = {}
): WidgetSizeStyle {
  const { cols, rows } = WIDGET_UNIT_SPAN[size]
  const rawUnit = unitExpression(minScale)

  // `height: 100%` rather than a cqi-derived length: a tile cannot resolve `cqi`
  // against the `@container` it itself establishes. Row height comes from the
  // grid's `grid-auto-rows`; 100% then fills that row whether the chrome is a
  // direct grid item OR nested inside a wrapper (e.g. RecentWriting's tilted
  // stack plate), where `gridRow`/`gridColumn` would otherwise be inert.
  return {
    ...controlTargetStyle(),
    '--widget-cell': CELL_FORMULA,
    '--widget-raw-u': rawUnit,
    '--widget-rows': String(rows),
    '--widget-scale': resolveScale(scale, density),
    '--widget-span': String(cols),
    '--widget-u': 'var(--widget-raw-u)',
    gridColumn: `span ${cols}`,
    gridRow: `span ${rows}`,
    height: '100%',
  }
}
