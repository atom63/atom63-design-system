import type {
  BrandId,
  ColorMode,
  FontFamily,
  IconTheme,
  OsSystem,
  PersonalizationOption,
  RadiusScale,
  SurfaceId,
  ThemeId,
  TypeScale,
} from './types'

export const MODE_OPTIONS = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'system', name: 'Auto' },
] as const satisfies readonly PersonalizationOption<ColorMode>[]

export const THEME_OPTIONS = [
  { id: 'modern', name: 'Modern' },
  { id: 'aqua', name: 'Aqua' },
  { id: 'retro', name: 'Retro' },
  { id: 'terminal', name: 'Terminal' },
] as const satisfies readonly PersonalizationOption<ThemeId>[]

export const BRAND_OPTIONS = [
  { id: 'auto', name: 'Auto' },
  { id: 'b1', name: 'b1' },
  { id: 'b2', name: 'b2' },
  { id: 'b3', name: 'b3' },
  { id: 'b4', name: 'b4' },
  { id: 'b5', name: 'b5' },
  { id: 'b6', name: 'b6' },
] as const satisfies readonly PersonalizationOption<BrandId>[]

export const SURFACE_OPTIONS = [
  { id: 'n1', name: 'n1' },
  { id: 'n2', name: 'n2' },
  { id: 'n3', name: 'n3' },
  { id: 'n4', name: 'n4' },
  { id: 'n5', name: 'n5' },
  { id: 'n6', name: 'n6' },
] as const satisfies readonly PersonalizationOption<SurfaceId>[]

export const TYPE_SCALE_OPTIONS = [
  { id: 'compact', name: 'Compact' },
  { id: 'normal', name: 'Normal' },
  { id: 'comfortable', name: 'Comfortable' },
  { id: 'large', name: 'Large' },
] as const satisfies readonly PersonalizationOption<TypeScale>[]

export const RADIUS_OPTIONS = [
  { id: 'none', name: 'None' },
  { id: 'subtle', name: 'Subtle' },
  { id: 'default', name: 'Default' },
  { id: 'round', name: 'Round' },
] as const satisfies readonly PersonalizationOption<RadiusScale>[]

export const FONT_OPTIONS = [
  { id: 'sans', name: 'Sans' },
  { id: 'serif', name: 'Serif' },
  { id: 'mono', name: 'Mono' },
  { id: 'pixel', name: 'Pixel' },
] as const satisfies readonly PersonalizationOption<FontFamily>[]

export const OS_OPTIONS = [
  { id: 'macos', name: 'macOS' },
  { id: 'windows', name: 'Windows' },
] as const satisfies readonly PersonalizationOption<OsSystem>[]

export const ICON_THEME_OPTIONS = [
  { id: 'realistic', name: 'HD' },
  { id: 'color', name: 'Color' },
  { id: 'neutral', name: 'Mono' },
  { id: 'primary', name: 'Primary' },
] as const satisfies readonly PersonalizationOption<IconTheme>[]
