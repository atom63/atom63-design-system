import type { CSSProperties } from 'react'
import type { WidgetSize } from '../types'
import { WIDGET_TYPE_FLOOR, type WidgetTypeFloorRole } from './widget-units'
import { wu, wuClamp } from './widget-unit-style'

/**
 * Intent roles for widget content type.
 *
 * Floors live on three buckets (`label` / `body` / `display`). Ramp roles map
 * onto those buckets so authors pick meaning, not raw px.
 *
 * Design-px targets are authored against `--widget-u` (256 design canvas).
 * Footprint steps (`small` / `medium` / `large`) are hand-authored growth for
 * roles that earn more room — they are not automatic scale-with-box.
 */
export const WIDGET_TYPE_ROLE_FLOOR = {
  /** Quiet uppercase identity on the chrome header. */
  chrome: 'label',
  /** Smallest supporting labels (stat keys, legends, zone tags). */
  label: 'label',
  /** Default reading copy. */
  body: 'body',
  /** Compact identity (handles, short names). */
  name: 'body',
  /** Content headings that are not the hero figure. */
  title: 'body',
  /** Featured content name (project title, primary listing). */
  headline: 'body',
  /** Mid-weight digital / tabular figures (profile stats). */
  stat: 'body',
  /** Hero figures — temperature, big totals. Unfloored. */
  display: 'display',
  /** Dense hero digits (clock faces beside a second column). Unfloored. */
  displayCompact: 'display',
} as const satisfies Record<string, WidgetTypeFloorRole>

export type WidgetTypeRampRole = keyof typeof WIDGET_TYPE_ROLE_FLOOR

type SteppedDesignPx = Record<WidgetSize, number>

interface WidgetTypeRecipe {
  designPx: number | SteppedDesignPx
  weight: number
  trackingEm?: number
  transform?: 'uppercase'
  leading?: number
  /**
   * Optional CSS-px floor override. When set, replaces the role's bucket floor
   * (`WIDGET_TYPE_FLOOR[…]`). Use for chrome that should sit quieter than
   * content `label` copy.
   */
  floorPx?: number
  /** Leading chrome icon design-px (WidgetCardTitle). */
  iconDesignPx?: number
  /** Leading chrome icon CSS-px floor. */
  iconFloorPx?: number
}

/**
 * Derived from the live widget inventory (Location place/temp/clock, Behance
 * stats, Open Source title, Instagram handle, WidgetCardTitle chrome).
 * Prefer `widgetTypeStyle(role, size)` over local SIZE maps or Tailwind
 * `text-*` for content type.
 *
 * ## Read this before changing a design-px value
 *
 * `--widget-u` is ALWAYS `188 / 256` ≈ `0.734`, at every host and every cell
 * size. `widgetPresentationStyle` divides the unit back out of the presentation
 * transform, so one canonical composition is scaled as a whole canvas rather
 * than re-resolved per cell. A design-px value therefore renders at
 * `design × 0.734` — the 256 canvas never renders 1:1.
 *
 * That makes the CSS-px floors (`WIDGET_TYPE_FLOOR`) load-bearing rather than a
 * rare safety net, and the ramp was previously authored as if they were rare:
 * `label` (10), `body` (13), `name` (14) and `title` (16) all resolved BELOW
 * their floor and rendered at a single 11–12px step, so four distinct roles
 * were separated only by weight and colour, and the authored headline-to-body
 * ratio of 1.69 rendered as 1.35. `chrome` even inverted — authored larger than
 * `label`, rendered smaller, because its `floorPx` override let it through.
 *
 * The content roles are now authored so `design × 0.734` clears the floor on
 * its own and lands on a deliberate rendered ladder at the 1×1 footprint:
 *
 * | role     | design | renders |
 * | -------- | ------ | ------- |
 * | chrome   | 14     | 10.3    |
 * | label    | 15     | 11.0    |
 * | body     | 17     | 12.5    |
 * | name     | 18     | 13.2    |
 * | title    | 20     | 14.7    |
 * | stat     | 22     | 16.2    |
 * | headline | 26     | 19.1    |
 * | display  | 48     | 35.3    |
 *
 * `display` / `displayCompact` are unchanged: they never floored, so their
 * rendered figures were already the calibrated ones.
 *
 * ## The footprint columns are a curve, not three free values
 *
 * `body` is deliberately FLAT at 17 across all three footprints: it is reading
 * copy, and a widget that changes its reading size when the tile grows is
 * harder to scan across a desktop, not easier. A wider tile buys measure and
 * room, not bigger prose.
 *
 * That makes every heading role's footprint column a RATIO against a fixed
 * body, and the previous values let the top of the ramp run away from the
 * bottom exactly where there is most type on screen:
 *
 * | role     | small | medium | large | old title:body |
 * | -------- | ----- | ------ | ----- | -------------- |
 * | title    | 20    | 23     | 30    | 1.18 → 1.76    |
 * | stat     | 22    | 24     | 29    |                |
 * | headline | 26    | 26     | 34    |                |
 *
 * A 1.18 step at 1×1 and a 1.76 step at 2×2 are not one hierarchy, they are two
 * — and the 2×2 one shouts, which is the whole "widget type feels too big"
 * complaint. `headline` was also non-monotonic (26 at both small and medium,
 * then a jump to 34), so doubling the tile width bought the hero name nothing
 * and doubling it again bought it 31%.
 *
 * `name` (18 / 19 / 22) was already the disciplined curve — roughly ×1.06 and
 * ×1.22 off its 1×1 value — so the other heading roles now follow it. The 1×1
 * column is untouched: that ladder is the calibrated one above, and the defect
 * was never there.
 *
 * | role     | small | medium | large | title:body   |
 * | -------- | ----- | ------ | ----- | ------------ |
 * | title    | 20    | 22     | 24    | 1.18 → 1.41  |
 * | stat     | 22    | 23     | 26    |              |
 * | headline | 26    | 28     | 32    |              |
 *
 * When adding a footprint step, move along this curve. A role that needs a
 * bigger jump than the curve gives is usually the wrong role for the job.
 */
export const WIDGET_TYPE_RAMP = {
  chrome: {
    // Mid quiet chrome: ~10.3px at OS63 (14×188/256), floored to 10 — between
    // the old text-xs (~12) and the too-quiet 9px experiment.
    designPx: 14,
    weight: 500,
    trackingEm: 0.025,
    transform: 'uppercase',
    leading: 1,
    floorPx: 10,
    // Icon sits just above the cap height.
    iconDesignPx: 14,
    iconFloorPx: 11,
  },
  label: {
    designPx: 15,
    weight: 500,
  },
  body: {
    designPx: 17,
    weight: 400,
  },
  name: {
    designPx: { small: 18, medium: 19, large: 22 },
    weight: 600,
  },
  title: {
    designPx: { small: 20, medium: 22, large: 24 },
    weight: 600,
  },
  headline: {
    designPx: { small: 26, medium: 28, large: 32 },
    weight: 600,
    // Display serif (Hedvig Letters Serif) with tall ascenders — 1.12 read as
    // two lines fighting for the same band once the headline cleared its floor.
    leading: 1.18,
  },
  stat: {
    designPx: { small: 22, medium: 23, large: 26 },
    weight: 600,
  },
  display: {
    designPx: { small: 48, medium: 44, large: 64 },
    weight: 600,
  },
  displayCompact: {
    designPx: { small: 40, medium: 34, large: 52 },
    weight: 600,
  },
} as const satisfies Record<WidgetTypeRampRole, WidgetTypeRecipe>

export interface WidgetTypeStyleOptions {
  /** Override design-px when a composition needs a one-off step. Prefer ramp. */
  designPx?: number
  /** Override weight (e.g. weather display uses extralight). */
  weight?: number
  leading?: number
  trackingEm?: number
}

function resolveDesignPx(designPx: number | SteppedDesignPx, size: WidgetSize): number {
  return typeof designPx === 'number' ? designPx : designPx[size]
}

/** Design-px target for a ramp role at a footprint. */
export function widgetTypeDesignPx(role: WidgetTypeRampRole, size: WidgetSize = 'medium'): number {
  return resolveDesignPx(WIDGET_TYPE_RAMP[role].designPx, size)
}

/**
 * Inline type styles for a ramp role.
 *
 * Returns `fontSize` (wu + floor), `fontWeight`, and chrome extras when present.
 * Pair with Tailwind only for color / truncation / layout — not for size.
 */
export function widgetTypeStyle(
  role: WidgetTypeRampRole,
  size: WidgetSize = 'medium',
  options?: WidgetTypeStyleOptions
): CSSProperties {
  // Narrow `as const` recipes omit optional fields; widen to the recipe shape.
  const recipe: WidgetTypeRecipe = WIDGET_TYPE_RAMP[role]
  const floorRole = WIDGET_TYPE_ROLE_FLOOR[role]
  const floorPx = recipe.floorPx ?? WIDGET_TYPE_FLOOR[floorRole]
  const designPx = options?.designPx ?? resolveDesignPx(recipe.designPx, size)
  const weight = options?.weight ?? recipe.weight
  const trackingEm = options?.trackingEm ?? recipe.trackingEm
  const leading = options?.leading ?? recipe.leading

  const style: CSSProperties = {
    fontSize: floorPx > 0 ? wuClamp(designPx, floorPx) : wu(designPx),
    fontWeight: weight,
  }

  if (trackingEm != null) {
    style.letterSpacing = `${trackingEm}em`
  }
  if (recipe.transform) {
    style.textTransform = recipe.transform
  }
  if (leading != null) {
    style.lineHeight = leading
  }

  return style
}

/**
 * Leading icon box for `WidgetCardTitle` — sized from the chrome recipe so the
 * glyph tracks the quiet header label.
 */
export function widgetChromeIconStyle(): CSSProperties {
  const recipe: WidgetTypeRecipe = WIDGET_TYPE_RAMP.chrome
  const designPx = recipe.iconDesignPx ?? resolveDesignPx(recipe.designPx, 'medium')
  const floorPx = recipe.iconFloorPx ?? recipe.floorPx ?? WIDGET_TYPE_FLOOR.label
  return {
    width: floorPx > 0 ? wuClamp(designPx, floorPx) : wu(designPx),
    height: floorPx > 0 ? wuClamp(designPx, floorPx) : wu(designPx),
  }
}

/**
 * Descender relief for text that also carries `line-clamp-*`.
 *
 * `line-clamp` implies `overflow: hidden`, and the clip box is exactly
 * `line-height × lines`. Any ramp role authored with tight leading therefore
 * has a line box SHORTER than the font's own box, and the last line's
 * descenders are shaved — silently, at every width, whether or not the clamp
 * actually truncates anything.
 *
 * Measured on the open-source headline (Hedvig Letters Serif 600, leading
 * 1.12): the box ended 1.95px above the ink. `0.24em` covers the font's full
 * declared descent rather than one sample string, so no glyph can reach past
 * it, and the matching negative margin hands the space back to layout — the
 * glyphs become whole without anything moving.
 *
 * `truncate` has the same problem for the same reason — it also sets
 * `overflow: hidden`, and a single line box is just as short.
 *
 * Pass `'emoji'` for a line that can carry one. Emoji ink runs well past the
 * font's declared descent, so the text relief only halves the cut: the profile
 * stat row still shaved 3px off a cat's chin at `leading: 1`.
 *
 * @example
 * <span className="line-clamp-4" style={widgetClampRelief()}>{title}</span>
 * <dt className="truncate" style={widgetClampRelief('emoji')}>{label}</dt>
 */
export function widgetClampRelief(content: 'emoji' | 'text' = 'text'): CSSProperties {
  const relief = content === 'emoji' ? '0.55em' : '0.24em'
  return {
    paddingBottom: relief,
    marginBottom: `-${relief}`,
  }
}
