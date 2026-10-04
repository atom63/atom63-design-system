import type { PluginSettings } from '../messages'

const THEME_TRANSITION_ID = 'cipher-theme-transition'
const THEME_TRANSITION_MS = 200

/** The Atom63 brand the plugin UI uses: b2, Cipher's orange. */
const BRAND = 'b2'
/** A tool panel packs controls tight: the Atom63 compact density. */
const DENSITY = 'compact'

let preference: PluginSettings['theme'] = 'system'
let figmaThemeObserver: MutationObserver | null = null

/**
 * "system" follows Figma: with `themeColors: true` Figma puts `figma-dark` on
 * <html> in dark mode, and the OS setting is the fallback outside Figma.
 */
function systemMode(): 'light' | 'dark' {
  const root = document.documentElement
  if (root.classList.contains('figma-dark')) return 'dark'
  if (root.classList.contains('figma-light')) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Writes the mode the Atom63 tokens read: the `dark`/`light` class and data-a63-mode. */
function writeMode() {
  const root = document.documentElement
  const mode = preference === 'system' ? systemMode() : preference
  root.classList.toggle('dark', mode === 'dark')
  root.classList.toggle('light', mode === 'light')
  root.dataset.a63Mode = mode
  root.dataset.a63Brand = BRAND
  root.dataset.a63Density = DENSITY
  root.style.colorScheme = mode
}

/**
 * Applies the theme setting. Atom63 resolves every token from the mode, so this
 * only sets the mode; "system" keeps following Figma's theme while the plugin
 * is open. When `animate` is true, a short transition smooths the color change.
 */
export function applyTheme(theme: PluginSettings['theme'], animate = false) {
  if (animate) enableThemeTransition()
  preference = theme
  writeMode()
  if (!figmaThemeObserver) {
    figmaThemeObserver = new MutationObserver(() => {
      if (preference === 'system') {
        const before = document.documentElement.dataset.a63Mode
        if (systemMode() !== before) writeMode()
      }
    })
    figmaThemeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }
}

/**
 * Temporarily inject a global transition on background-color, color, border-color,
 * box-shadow, and fill so the theme swap animates. Removes itself after the
 * transition duration to avoid interfering with hover/focus transitions.
 */
function enableThemeTransition() {
  let el = document.getElementById(THEME_TRANSITION_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = THEME_TRANSITION_ID
    document.head.appendChild(el)
  }
  el.textContent = `*, *::before, *::after {
  transition: background-color ${THEME_TRANSITION_MS}ms ease-out,
              color ${THEME_TRANSITION_MS}ms ease-out,
              border-color ${THEME_TRANSITION_MS}ms ease-out,
              box-shadow ${THEME_TRANSITION_MS}ms ease-out,
              fill ${THEME_TRANSITION_MS}ms ease-out !important;
}`
  // Remove after transition completes
  setTimeout(() => el?.remove(), THEME_TRANSITION_MS + 50)
}
