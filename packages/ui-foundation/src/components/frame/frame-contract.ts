import type { VisualArchetypeId } from '../../visual-archetypes'

// Faithful to prod @atom63/ui frame.tsx — an OS-style window/flyout chrome:
// an outer "tray" surface wrapping inner "panel" surfaces, with a shared border
// weight. Prod modeled this with `cva`; here the variant unions live in the
// foundation and the recipe keys off data-* attributes (badge/button pattern).
//
// Chrome is tray (outer) + panel (inner). `variant` is a named tray+panel PRESET;
// `tray` / `panel` override the preset surface; `border` is Frame-level (inherited
// by nested panels, per-panel overridable).

// Named tray+panel pairs (prod FRAME_PRESETS).
export const frameVariants = ['muted-background', 'muted-card'] as const
export const frameTrays = ['muted', 'card', 'background'] as const
export const framePanelSurfaces = ['background', 'card', 'muted'] as const
export const frameBorders = ['off', 'subtle', 'strong'] as const
export const frameSlots = [
  'frame',
  'frame-panel',
  'frame-panel-header',
  'frame-panel-title',
  'frame-panel-description',
  'frame-panel-footer',
] as const
export const frameStates = ['default', 'border-off', 'border-subtle', 'border-strong'] as const
export const frameVisualArchetypes = ['surface'] as const satisfies readonly VisualArchetypeId[]

export type FrameVariant = (typeof frameVariants)[number]
export type FrameTray = (typeof frameTrays)[number]
export type FramePanelSurface = (typeof framePanelSurfaces)[number]
export type FrameBorder = (typeof frameBorders)[number]
export type FrameSlot = (typeof frameSlots)[number]
export type FrameState = (typeof frameStates)[number]
export type FrameVisualArchetype = (typeof frameVisualArchetypes)[number]

/** Preset → {tray, panel} surface pair. Mirrors prod FRAME_PRESETS. */
export const framePresets = {
  'muted-background': { tray: 'muted', panel: 'background' },
  'muted-card': { tray: 'muted', panel: 'card' },
} satisfies Record<FrameVariant, { tray: FrameTray; panel: FramePanelSurface }>

export interface FrameContract {
  defaultVariant: FrameVariant
  defaultBorder: FrameBorder
  variants: readonly FrameVariant[]
  trays: readonly FrameTray[]
  panelSurfaces: readonly FramePanelSurface[]
  borders: readonly FrameBorder[]
  slots: readonly FrameSlot[]
  states: readonly FrameState[]
  visualArchetypes: readonly FrameVisualArchetype[]
  presets: typeof framePresets
}

export const frameContract = {
  defaultVariant: 'muted-background',
  defaultBorder: 'strong',
  variants: frameVariants,
  trays: frameTrays,
  panelSurfaces: framePanelSurfaces,
  borders: frameBorders,
  slots: frameSlots,
  states: frameStates,
  visualArchetypes: frameVisualArchetypes,
  presets: framePresets,
} satisfies FrameContract

/** Resolve a Frame's effective tray+panel+border from variant/override props. */
export function resolveFrameChrome({
  variant = frameContract.defaultVariant,
  tray,
  panel,
  border = frameContract.defaultBorder,
}: {
  variant?: FrameVariant
  tray?: FrameTray
  panel?: FramePanelSurface
  border?: FrameBorder
}): { tray: FrameTray; panel: FramePanelSurface; border: FrameBorder } {
  const preset = framePresets[variant]
  return {
    tray: tray ?? preset.tray,
    panel: panel ?? preset.panel,
    border,
  }
}
