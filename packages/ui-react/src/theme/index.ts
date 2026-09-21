export {
  AppearanceMenu,
  AppearanceMenuTrigger,
  type AppearanceMenuProps,
} from './appearance/appearance-menu'
export {
  AppearancePanel,
  type AppearancePanelProps,
  type AppearanceSectionId,
} from './appearance/appearance-panel'
export { AppearanceSection, type AppearanceSectionProps } from './appearance/appearance-section'
export { applyPersonalization } from './core/apply-personalization'
export {
  AUTO_FALLBACK_COLOR,
  AUTO_PRIMARY_ID,
  applyAutoColorRamp,
  clearAutoColorRamp,
  extractDominantColor,
  isAutoPrimary,
  type ExtractedColor,
} from './core/auto-primary'
export { createPersonalizationController } from './providers/create-personalization-controller'
export { createThemeProvider } from './providers/create-theme-provider'
export {
  BRAND_OPTIONS,
  FONT_OPTIONS,
  ICON_THEME_OPTIONS,
  MODE_OPTIONS,
  OS_OPTIONS,
  RADIUS_OPTIONS,
  SURFACE_OPTIONS,
  THEME_OPTIONS,
  TYPE_SCALE_OPTIONS,
} from './core/options'
export { RangeTokenControl, type RangeTokenControlProps } from './controls/range-token-control'
export {
  SegmentedTokenControl,
  type SegmentedTokenControlProps,
} from './controls/segmented-token-control'
export { SwatchTokenControl, type SwatchTokenControlProps } from './controls/swatch-token-control'
export type {
  BrandId,
  ColorMode,
  FontFamily,
  IconTheme,
  OsSystem,
  PersonalizationController,
  PersonalizationOption,
  PersonalizationState,
  RadiusScale,
  SurfaceId,
  ThemeContextValue,
  ThemeId,
  ThemeMode,
  ThemeModeOption,
  CreateThemeProviderOptions,
  TypeScale,
} from './core/types'
export {
  VisualChoiceControl,
  type VisualChoiceControlProps,
  type VisualChoiceOption,
} from './controls/visual-choice-control'
