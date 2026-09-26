/**
 * Outer shell of the themed widget surface — the rim.
 *
 * The rim is real geometry between the tile edge and the card face, so it can
 * carry a gradient across the whole frame, its own backdrop-filter, and a
 * smaller inner radius; a `box-shadow` inset can do none of those.
 *
 * It is a BORDER, not padding. Both inset the face identically, but only a
 * border follows `border-radius` — it mitres around each corner arc and takes a
 * per-side color. That is what lets a bevel theme light the top and left edges
 * while darkening the bottom and right AT ANY RADIUS. Radius is a
 * personalization axis, so the chrome has to hold up across it, not just at
 * each theme's default.
 *
 * The drop shadow belongs here, on the outermost box, so it casts from the true
 * tile edge. The shell's z-index scopes the face's material pseudo to this
 * surface's own stacking context so it can't bleed behind sibling tiles.
 *
 * The declarations live in `@atom63/widgets/styles.css` (`.a63-WidgetSurface`).
 */
export const WIDGET_RIM_SHELL_CLASS = 'a63-WidgetSurface'

/**
 * Inner face of the themed widget surface — the card material.
 *
 * The frosted-glass fill + backdrop blur live on an isolated `::before` layer
 * (behind the content), not on the face element itself. Decoupling the blur
 * from content paint fixes the Chrome backdrop-filter flicker (crbug 41471914)
 * and the border-radius bleed (crbug 41212594 / 41432992).
 *
 * Deliberately NOT `position: relative`: a host can compose this class with its
 * own absolute positioning (a drag placeholder, for instance). `WidgetSurface`
 * adds the positioning itself to anchor the ::before material to the face.
 *
 * The declarations live in `@atom63/widgets/styles.css`
 * (`.a63-WidgetSurface-face`).
 */
export const WIDGET_CARD_SURFACE_CLASS = 'a63-WidgetSurface-face'
