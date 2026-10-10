import {
  type FrameBorder,
  type FramePanelSurface,
  type FrameTray,
  type FrameVariant,
  frameContract,
  framePresets,
} from './frame-contract'

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
