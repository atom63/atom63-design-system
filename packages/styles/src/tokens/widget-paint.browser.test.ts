import { afterEach, describe, expect, it } from 'vitest'
import { cssVar, root } from '../test/apply-styles'

afterEach(() => {
  document.documentElement.removeAttribute('data-a63-theme')
  document.documentElement.removeAttribute('data-a63-mode')
  document.documentElement.classList.remove('dark', 'light')
  document.body.replaceChildren()
})

function parseCssAlpha(color: string): number | null {
  const trimmed = color.trim()
  if (!trimmed || trimmed === 'transparent') return 0
  if (trimmed.startsWith('#')) {
    if (trimmed.length === 9) return Number.parseInt(trimmed.slice(7, 9), 16) / 255
    return 1
  }
  const match = trimmed.match(/^(?:rgba?|hsla?|color)\((?:[^)]*?[,\s/]+)([\d.]+%?)\s*\)$/i)
  if (!match) {
    // rgb() without alpha, named colors, etc.
    if (/^rgb\(/i.test(trimmed) || /^hsl\(/i.test(trimmed)) return 1
    return null
  }
  const raw = match[1]
  return raw.endsWith('%') ? Number.parseFloat(raw) / 100 : Number.parseFloat(raw)
}

function hasPaint(backgroundColor: string, backgroundImage: string): boolean {
  const image = backgroundImage.trim()
  if (image && image !== 'none') return true
  const alpha = parseCssAlpha(backgroundColor)
  return alpha !== null && alpha > 0.02
}

describe('widget surface paint contract', () => {
  it('resolves a visible ::before material via widget background tokens', () => {
    const themes = ['modern', 'aqua', 'retro', 'terminal'] as const

    for (const theme of themes) {
      root().setAttribute('data-a63-theme', theme)
      root().setAttribute('data-a63-mode', 'dark')
      root().classList.add('dark')

      const colorToken = cssVar('--a63-widget-background-color')
      const imageToken = cssVar('--a63-widget-background-image')
      expect(colorToken, `${theme} widget background color`).not.toBe('')

      // Mirror WIDGET_CARD_SURFACE_CLASS ::before paint without Tailwind in this package.
      const before = document.createElement('div')
      before.style.backgroundColor = 'var(--a63-widget-background-color)'
      before.style.backgroundImage = 'var(--a63-widget-background-image)'
      document.body.appendChild(before)

      const style = getComputedStyle(before)
      expect(
        hasPaint(style.backgroundColor, style.backgroundImage),
        `${theme}: widget ::before material must not be fully transparent (got color=${style.backgroundColor}, image=${style.backgroundImage}, tokens color=${colorToken}, image=${imageToken})`
      ).toBe(true)

      before.remove()
    }
  })

  it('keeps widget foreground and border tokens authored', () => {
    root().setAttribute('data-a63-theme', 'modern')
    root().setAttribute('data-a63-mode', 'dark')
    root().classList.add('dark')

    expect(cssVar('--a63-widget-foreground')).not.toBe('')
    expect(cssVar('--a63-widget-border-color')).not.toBe('')
    expect(cssVar('--a63-widget-shadow')).not.toBe('')
  })

  it('splits the raised media shadow by mode', () => {
    root().setAttribute('data-a63-theme', 'modern')

    root().setAttribute('data-a63-mode', 'light')
    root().classList.add('light')
    const lightResting = cssVar('--a63-widget-media-shadow')
    const lightRaised = cssVar('--a63-widget-media-shadow-raised')

    root().classList.remove('light')
    root().setAttribute('data-a63-mode', 'dark')
    root().classList.add('dark')
    const darkResting = cssVar('--a63-widget-media-shadow')
    const darkRaised = cssVar('--a63-widget-media-shadow-raised')

    for (const value of [lightResting, lightRaised, darkResting, darkRaised]) {
      expect(value).not.toBe('')
    }

    // A dark face needs a heavier throw, so the two modes must not collapse.
    expect(darkResting).not.toBe(lightResting)
    expect(darkRaised).not.toBe(lightRaised)
    // The centered print sits above its neighbours in both modes.
    expect(darkRaised).not.toBe(darkResting)
  })
})
