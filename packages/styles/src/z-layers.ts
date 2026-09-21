/**
 * Canonical z-index scale — typed mirror of the `--z-layer-*` custom
 * properties in `tokens/foundation/primitives.css`. CSS is the source of
 * truth; this mirror exists for JS consumers (e.g. the os63 windowing engine)
 * that need numbers.
 *
 * Keep in sync with `tokens/foundation/primitives.css`; the archived token package keeps
 * the drift-guarded mirror (`z-layers.test.ts`) for its own token consumers.
 */
export const Z_LAYERS = {
  below: -1,
  default: 0,
  raised: 1,
  base: 10,
  sticky: 20,
  windowOverlay: 40,
  header: 50,
  drawer: 90,
  window: 300,
  snapPreview: 390,
  windowCeiling: 399,
  flyout: 400,
  launcher: 450,
  scrim: 500,
  modal: 600,
  toast: 1050,
  dock: 900,
  overviewBackdrop: 905,
  overviewWindow: 910,
  overviewLabel: 940,
  switcher: 950,
  menu: 960,
  popover: 970,
  tooltip: 980,
  overlay: 990,
  lock: 1000,
  boot: 1100,
} as const

export type ZLayer = keyof typeof Z_LAYERS
