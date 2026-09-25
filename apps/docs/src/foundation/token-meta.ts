/** Curated metadata mirroring `packages/styles/src/tokens` — update when token files change. */

export const TOKEN_LAYERS = [
  {
    file: 'foundation/primitives.css',
    role: 'Raw color, spacing, motion, and z-index values.',
  },
  {
    file: 'foundation/palette.css',
    role: 'Named brand, neutral, and status ramps.',
  },
  {
    file: 'surface.css',
    role: 'Light and dark surface steps for each surface palette.',
  },
  {
    file: 'foundation/effects.css',
    role: 'Shared shadow and blur scales.',
  },
  {
    file: 'foundation/radius.css',
    role: 'Corner scale derived from the base radius and multiplier.',
  },
  {
    file: 'foundation/fonts.css',
    role: 'Font-family primitives.',
  },
  {
    file: 'foundation/typography.css',
    role: 'Responsive type sizes and line heights.',
  },
  {
    file: 'foundation/motion.css',
    role: 'Semantic duration and easing aliases.',
  },
  {
    file: 'space.css',
    role: 'Atom63 spacing aliases.',
  },
  {
    file: 'radius.css',
    role: 'Radius-axis selectors and component geometry bridges.',
  },
  {
    file: 'type-scale.css',
    role: 'Type-scale axis selectors.',
  },
  {
    file: 'font.css',
    role: 'Font-family axis selectors.',
  },
  {
    file: 'motion.css',
    role: 'Recipe-facing motion contract and reduced-motion overrides.',
  },
  {
    file: 'semantics.css',
    role: 'Canonical surface, text, border, action, and status roles.',
  },
  {
    file: 'brand.css',
    role: 'Brand and neutral-family axis mappings.',
  },
  {
    file: 'surface.css',
    role: 'Surface-treatment axis mappings.',
  },
] as const

export const SEMANTIC_COLORS = [
  { name: 'surface-page', variable: '--a63-surface-page' },
  { name: 'surface-panel', variable: '--a63-surface-panel' },
  { name: 'surface-overlay', variable: '--a63-surface-overlay' },
  { name: 'surface-muted', variable: '--a63-surface-muted' },
  { name: 'surface-control', variable: '--a63-surface-control' },
  { name: 'control-hover', variable: '--a63-surface-control-hover' },
  { name: 'text-primary', variable: '--a63-text-primary' },
  { name: 'text-secondary', variable: '--a63-text-secondary' },
  { name: 'border-subtle', variable: '--a63-border-subtle' },
  { name: 'border-control', variable: '--a63-border-control' },
  { name: 'action-primary', variable: '--a63-action-primary' },
  { name: 'primary-fg', variable: '--a63-action-primary-foreground' },
  { name: 'action-danger', variable: '--a63-action-danger' },
  { name: 'status-success', variable: '--a63-status-success' },
  { name: 'status-warning', variable: '--a63-status-warning' },
  { name: 'status-info', variable: '--a63-status-info' },
  { name: 'focus-ring', variable: '--a63-focus-ring' },
  { name: 'scrim', variable: '--a63-scrim' },
  { name: 'media-stage', variable: '--a63-media-stage' },
  { name: 'media-scrim', variable: '--a63-media-scrim' },
  { name: 'on-media-fg', variable: '--a63-on-media-foreground' },
  { name: 'on-media-surface', variable: '--a63-on-media-surface' },
  { name: 'on-media-strong', variable: '--a63-on-media-surface-strong' },
  { name: 'on-media-border', variable: '--a63-on-media-border' },
  { name: 'on-media-ring', variable: '--a63-on-media-ring' },
  { name: 'on-media-veil', variable: '--a63-on-media-veil' },
  { name: 'on-media-veil-strong', variable: '--a63-on-media-veil-strong' },
] as const

export const SURFACE_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

export const BRAND_SCALES = [
  { id: 'b1', label: 'Blue (primary)' },
  { id: 'b2', label: 'Orange' },
  { id: 'b3', label: 'Green' },
  { id: 'b4', label: 'Pink' },
  { id: 'b5', label: 'Purple' },
  { id: 'b6', label: 'Red' },
] as const

export const NEUTRAL_SCALES = [
  { id: 'n1', label: 'Gray (default surface)' },
  { id: 'n2', label: 'Sand' },
  { id: 'n3', label: 'Slate' },
  { id: 'n4', label: 'Blue gray' },
  { id: 'n5', label: 'Sage' },
  { id: 'n6', label: 'Stone' },
] as const

export const STATUS_PRIMITIVES = [
  { id: 'danger', utility: 'bg-danger-500' },
  { id: 'success', utility: 'bg-success-500' },
  { id: 'warning', utility: 'bg-warning-500' },
  { id: 'info', utility: 'bg-info-500' },
] as const

export const TYPE_SCALE = [
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
] as const

/** Base (mobile) px from typography.css :root — used for doc previews */
export const TYPE_SCALE_PREVIEW_PX: Record<
  (typeof TYPE_SCALE)[number],
  { fontSize: string; lineHeight: string }
> = {
  xs: { fontSize: '12px', lineHeight: '18px' },
  sm: { fontSize: '13px', lineHeight: '20px' },
  base: { fontSize: '15px', lineHeight: '23px' },
  lg: { fontSize: '16px', lineHeight: '24px' },
  xl: { fontSize: '18px', lineHeight: '23px' },
  '2xl': { fontSize: '19px', lineHeight: '24px' },
  '3xl': { fontSize: '21px', lineHeight: '26px' },
  '4xl': { fontSize: '23px', lineHeight: '29px' },
  '5xl': { fontSize: '26px', lineHeight: '33px' },
  '6xl': { fontSize: '28px', lineHeight: '35px' },
  '7xl': { fontSize: '31px', lineHeight: '39px' },
  '8xl': { fontSize: '35px', lineHeight: '44px' },
  '9xl': { fontSize: '39px', lineHeight: '49px' },
}

/** Default px at --corner-radius: 10px, --radius-multiplier: 1 */
export const RADIUS_SCALE = [
  { token: '2xs', utility: 'rounded-2xs', px: '2px', cssVar: '--radius-2xs' },
  { token: 'xs', utility: 'rounded-xs', px: '4px', cssVar: '--radius-xs' },
  { token: 'sm', utility: 'rounded-sm', px: '6px', cssVar: '--radius-sm' },
  { token: 'md', utility: 'rounded-md', px: '8px', cssVar: '--radius-md' },
  { token: 'lg', utility: 'rounded-lg', px: '10px', cssVar: '--radius-lg' },
  { token: 'xl', utility: 'rounded-xl', px: '14px', cssVar: '--radius-xl' },
  { token: '2xl', utility: 'rounded-2xl', px: '18px', cssVar: '--radius-2xl' },
  { token: '3xl', utility: 'rounded-3xl', px: '22px', cssVar: '--radius-3xl' },
  { token: '4xl', utility: 'rounded-4xl', px: '26px', cssVar: '--radius-4xl' },
  { token: 'full', utility: 'rounded-full', px: '28px', cssVar: '--radius-full' },
] as const

/**
 * The canonical z-index scale. Mirrors `--z-layer-*` in
 * `packages/styles/src/tokens/foundation/primitives.css`; the typed
 * `Z_LAYERS` export in `@atom63/styles/z-layers` mirrors the same values for JS.
 * Grouped by the band each token belongs to.
 */
export const Z_LAYER_SCALE = [
  {
    group: 'In-context',
    token: 'below',
    value: -1,
    role: 'Behind the local baseline — active-tab / segment backplates',
  },
  { group: 'In-context', token: 'default', value: 0, role: 'Normal document flow' },
  {
    group: 'In-context',
    token: 'raised',
    value: 1,
    role: 'Hairline lift — sticky-note fold, overlapping borders',
  },
  { group: 'In-context', token: 'base', value: 10, role: 'Content lift, selected desktop item' },
  {
    group: 'In-context',
    token: 'sticky',
    value: 20,
    role: 'Sticky rows inside a scroll container',
  },
  {
    group: 'In-context',
    token: 'window-overlay',
    value: 40,
    role: 'Scrim inside a window (behind a sidebar)',
  },
  {
    group: 'In-context',
    token: 'header',
    value: 50,
    role: 'Sticky section header, window-scoped dialog',
  },
  { group: 'In-context', token: 'drawer', value: 90, role: 'Slide-out drawer over window content' },
  {
    group: 'Window band',
    token: 'window',
    value: 300,
    role: 'Floor of the focus-shuffle band (300–399)',
  },
  {
    group: 'Window band',
    token: 'snap-preview',
    value: 390,
    role: 'Snap-zone preview among windows',
  },
  { group: 'Window band', token: 'window-ceiling', value: 399, role: 'Ceiling of the focus band' },
  { group: 'Shell', token: 'flyout', value: 400, role: 'Desktop flyout panels' },
  { group: 'Shell', token: 'launcher', value: 450, role: 'Start / launcher bar' },
  { group: 'Shell', token: 'scrim', value: 500, role: 'Dim behind modals' },
  { group: 'Shell', token: 'modal', value: 600, role: 'Dialogs, sheets, drawers' },
  { group: 'Shell', token: 'dock', value: 900, role: 'Dock / taskbar' },
  { group: 'Shell', token: 'overview-backdrop', value: 905, role: 'Task-view scrim' },
  {
    group: 'Shell',
    token: 'overview-window',
    value: 910,
    role: 'Task-view thumbnail base (dynamic)',
  },
  { group: 'Shell', token: 'overview-label', value: 940, role: 'Task-view window labels' },
  { group: 'Shell', token: 'switcher', value: 950, role: 'Alt-tab window switcher' },
  { group: 'Shell', token: 'menu', value: 960, role: 'Dropdowns, selects, context menus' },
  { group: 'Shell', token: 'popover', value: 970, role: 'Popovers, hover cards' },
  { group: 'Shell', token: 'tooltip', value: 980, role: 'Tooltips' },
  { group: 'System', token: 'overlay', value: 990, role: 'Full-screen brightness / dim' },
  { group: 'System', token: 'lock', value: 1000, role: 'Lock screen' },
  { group: 'System', token: 'toast', value: 1050, role: 'Notifications above lock' },
  { group: 'System', token: 'boot', value: 1100, role: 'Boot / splash — top-most' },
] as const

export const DURATION_PRIMITIVES = [
  { token: 'duration-none', ms: '0' },
  { token: 'duration-83', ms: '83' },
  { token: 'duration-150', ms: '150' },
  { token: 'duration-167', ms: '167' },
  { token: 'duration-250', ms: '250' },
  { token: 'duration-333', ms: '333' },
  { token: 'duration-400', ms: '400' },
  { token: 'duration-450', ms: '450' },
  { token: 'duration-500', ms: '500' },
  { token: 'duration-667', ms: '667' },
  { token: 'duration-1000', ms: '1000' },
  { token: 'duration-1500', ms: '1500' },
] as const

export const DURATION_ALIASES = [
  { alias: 'duration-instant', maps: 'duration-none' },
  { alias: 'duration-fast', maps: 'duration-150' },
  { alias: 'duration-normal', maps: 'duration-250' },
  { alias: 'duration-overlay', maps: 'duration-450' },
  { alias: 'duration-swipe-dismiss', maps: 'duration-400' },
  { alias: 'duration-slow', maps: 'duration-500' },
  { alias: 'duration-slower', maps: 'duration-1000' },
] as const

export const EASING_CURVES = [
  'ease-linear',
  'ease-fast',
  'ease-pointtopoint',
  'ease-spring',
  'ease-soft',
  'ease-inout',
  'ease-overlay',
  'ease-scrim',
  'ease-standard',
  'ease-emphasized',
] as const

export const SHADOW_SCALE = [
  { token: '2xs', utility: 'shadow-2xs' },
  { token: 'xs', utility: 'shadow-xs' },
  { token: 'sm', utility: 'shadow-sm' },
  { token: 'md', utility: 'shadow-md' },
  { token: 'lg', utility: 'shadow-lg' },
  { token: 'xl', utility: 'shadow-xl' },
  { token: '2xl', utility: 'shadow-2xl' },
] as const

export const BLUR_SCALE = [
  { token: 'xs', utility: 'backdrop-blur-xs' },
  { token: 'sm', utility: 'backdrop-blur-sm' },
  { token: 'md', utility: 'backdrop-blur-md' },
  { token: 'lg', utility: 'backdrop-blur-lg' },
  { token: 'xl', utility: 'backdrop-blur-xl' },
  { token: '2xl', utility: 'backdrop-blur-2xl' },
  { token: '3xl', utility: 'backdrop-blur-3xl' },
] as const
