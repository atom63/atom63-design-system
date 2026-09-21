/**
 * DS-native personalization model.
 *
 * Every axis is a discrete union except surfaceTint (a 0–100 continuous token).
 * The controller applies these as `data-a63-*` attributes + `--a63-surface-tint`
 * — never inline `--primary`/`--surface-*` (that shadows the semantic layer).
 */

export type ColorMode = 'light' | 'dark' | 'system'
export type ThemeId = 'modern' | 'aqua' | 'retro' | 'terminal'
export type BrandId = 'auto' | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6'
export type SurfaceId = 'n1' | 'n2' | 'n3' | 'n4' | 'n5' | 'n6'
export type TypeScale = 'compact' | 'normal' | 'comfortable' | 'large'
export type RadiusScale = 'none' | 'subtle' | 'default' | 'round'
export type FontFamily = 'sans' | 'serif' | 'mono' | 'pixel'
export type OsSystem = 'macos' | 'windows'
export type IconTheme = 'realistic' | 'color' | 'neutral' | 'primary'

export interface PersonalizationState {
  mode: ColorMode
  theme: ThemeId
  brand: BrandId
  surface: SurfaceId
  /** 0–100; bends the neutral surfaces toward the brand hue. */
  surfaceTint: number
  typeScale: TypeScale
  radius: RadiusScale
  font: FontFamily
  os: OsSystem
  iconTheme: IconTheme
  /** Wallpaper id (consumer-defined catalog); null = none. Feeds the auto brand. */
  wallpaper: string | null
}

export interface PersonalizationOption<T extends string = string> {
  id: T
  /** Display label for the option (matches the axis value id spelling). */
  name: string
  description?: string
}

export interface PersonalizationController {
  state: PersonalizationState
  setMode: (mode: ColorMode) => void
  setTheme: (theme: ThemeId) => void
  setBrand: (brand: BrandId) => void
  setSurface: (surface: SurfaceId) => void
  setSurfaceTint: (surfaceTint: number) => void
  setTypeScale: (typeScale: TypeScale) => void
  setRadius: (radius: RadiusScale) => void
  setFont: (font: FontFamily) => void
  setOs: (os: OsSystem) => void
  setIconTheme: (iconTheme: IconTheme) => void
  setWallpaper: (wallpaper: string | null) => void
  update: (partial: Partial<PersonalizationState>) => void
  reset: () => void
}

/**
 * Light/dark mode PROVIDER contract. Relocated from @atom63/theme with
 * `createThemeProvider` — the DS mode context factory. `ThemeMode` is the
 * provider's spelling of `ColorMode` (identical union), kept as an alias so the
 * provider and its consumers read naturally.
 */
export type ThemeMode = ColorMode
export type ThemeModeOption = ColorMode

export type CreateThemeProviderOptions = {
  /** localStorage key (unique per product: `theme`, `ds-theme`, `vf-theme`, …) */
  storageKey: string
  defaultTheme?: ThemeMode
  /** Allowed stored values; omit `system` for docs-style binary themes */
  modes?: ThemeModeOption[]
  /** Cross-fade via View Transitions API when available */
  viewTransition?: boolean
}

export type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  /** Flip light ↔ dark (ignores system as a target) */
  toggleTheme: () => void
  /** Alias for `toggleTheme` (design-system layout) */
  toggle: () => void
  isDark: boolean
  isLight: boolean
  isSystem: boolean
  isChanging: boolean
  disableTransitions: () => void
}
