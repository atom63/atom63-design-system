import type { ColorMode, PersonalizationState } from './types'

function resolveIsDark(mode: ColorMode): boolean {
  if (mode === 'dark') {
    return true
  }
  if (mode === 'light') {
    return false
  }
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function clampTint(tint: number): number {
  if (!Number.isFinite(tint)) {
    return 0
  }
  return Math.max(0, Math.min(100, tint))
}

/**
 * Apply personalization to `root` as DS-native attributes + the surface-tint
 * token. Synchronous and side-effect-narrow: it sets `data-a63-*` + one inline
 * token (`--a63-surface-tint`). It does NOT derive the `auto` brand ramp (the
 * controller's async effect owns `--color-auto-*`), and it NEVER writes inline
 * `--primary`/`--surface-*` — those would shadow the `--a63-*` semantic layer.
 */
export function applyPersonalization(
  state: PersonalizationState,
  root: HTMLElement = document.documentElement
): void {
  // Mode — class (Tailwind `dark:` + DS `:is(.dark,…)`) and attribute.
  const isDark = resolveIsDark(state.mode)
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
  root.setAttribute('data-a63-mode', isDark ? 'dark' : 'light')

  // Theme — always set, including `modern`. Modern is an explicit theme in
  // @atom63/styles: its tactile control/field shadow overrides live under
  // [data-a63-theme="modern"], so removing the attr would flatten them to the
  // bare base (--a63-control-shadow: none). Every theme is an attribute value.
  root.setAttribute('data-a63-theme', state.theme)

  // Brand — including `auto` (the Phase-1 CSS falls back to b1; the controller
  // fills --color-auto-* asynchronously when brand === 'auto').
  root.setAttribute('data-a63-brand', state.brand)

  // Surface family + tint (tint is the one intended inline token).
  root.setAttribute('data-a63-surface', state.surface)
  root.style.setProperty('--a63-surface-tint', `${clampTint(state.surfaceTint)}%`)

  // Scalar + font axes.
  root.setAttribute('data-a63-type-scale', state.typeScale)
  root.setAttribute('data-a63-radius', state.radius)
  root.setAttribute('data-a63-font', state.font)

  // Behavioral axes (read by chrome/icon renderers; no token math).
  root.setAttribute('data-a63-os', state.os)
  root.setAttribute('data-a63-icon-theme', state.iconTheme)
}
