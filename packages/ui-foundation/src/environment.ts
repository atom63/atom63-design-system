import { personalizationAxes } from './axes'

/*
 * Runtime environment dimensions currently driven by UIProvider. Value tuples,
 * types, and defaults derive from the personalization-axes SSOT (axes.ts).
 *
 * UIProvider stamps a subset of axes (designLanguage, mode, theme, brand, input,
 * density, surface). The remaining runtime axes (surfaceTint, typeScale, radius,
 * font, os, iconTheme) are stamped by PersonalizationController /
 * applyPersonalization — see personalizationAxes.*.runtime.
 */

export const designLanguages = personalizationAxes.designLanguage.values
export const modes = personalizationAxes.mode.values
export const themes = personalizationAxes.theme.values
export const inputs = personalizationAxes.input.values
export const densities = personalizationAxes.density.values
export const brands = personalizationAxes.brand.values
export const surfaces = personalizationAxes.surface.values
export const typeScales = personalizationAxes.typeScale.values
export const radii = personalizationAxes.radius.values
export const fonts = personalizationAxes.font.values
export const osSystems = personalizationAxes.os.values
export const iconThemes = personalizationAxes.iconTheme.values

export type DesignLanguage = (typeof designLanguages)[number]
export type Mode = (typeof modes)[number]
export type Theme = (typeof themes)[number]
export type PointerInput = (typeof inputs)[number]
export type Density = (typeof densities)[number]
export type Brand = (typeof brands)[number]
export type Surface = (typeof surfaces)[number]
export type TypeScale = (typeof typeScales)[number]
export type RadiusScale = (typeof radii)[number]
export type FontFamily = (typeof fonts)[number]
export type OsSystem = (typeof osSystems)[number]
export type IconTheme = (typeof iconThemes)[number]

/** Axes stamped by UIProvider (subset of personalizationAxes). */
export interface UIEnvironment {
  brand: Brand
  density: Density
  designLanguage: DesignLanguage
  input: PointerInput
  mode: Mode
  surface: Surface
  theme: Theme
}

export const defaultUIEnvironment = {
  brand: personalizationAxes.brand.default,
  density: personalizationAxes.density.default,
  designLanguage: personalizationAxes.designLanguage.default,
  input: personalizationAxes.input.default,
  mode: personalizationAxes.mode.default,
  surface: personalizationAxes.surface.default,
  theme: personalizationAxes.theme.default,
} satisfies UIEnvironment
