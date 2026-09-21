import { beforeEach, describe, expect, it } from 'vitest'
import { applyPersonalization } from './apply-personalization'
import type { PersonalizationState } from './types'

const FULL: PersonalizationState = {
  mode: 'dark',
  theme: 'aqua',
  brand: 'b2',
  surface: 'n3',
  surfaceTint: 40,
  typeScale: 'comfortable',
  radius: 'round',
  font: 'mono',
  os: 'macos',
  iconTheme: 'primary',
  wallpaper: 'horizon',
}

describe('applyPersonalization', () => {
  beforeEach(() => {
    const el = document.documentElement
    el.removeAttribute('style')
    el.className = ''
    for (const a of [
      'data-a63-mode',
      'data-a63-theme',
      'data-a63-brand',
      'data-a63-surface',
      'data-a63-type-scale',
      'data-a63-radius',
      'data-a63-font',
      'data-a63-os',
      'data-a63-icon-theme',
    ]) {
      el.removeAttribute(a)
    }
  })

  it('maps every axis to its data-a63-* attribute + surface-tint token', () => {
    const el = document.documentElement
    applyPersonalization(FULL)
    expect(el.getAttribute('data-a63-mode')).toBe('dark')
    expect(el.classList.contains('dark')).toBe(true)
    expect(el.getAttribute('data-a63-theme')).toBe('aqua')
    expect(el.getAttribute('data-a63-brand')).toBe('b2')
    expect(el.getAttribute('data-a63-surface')).toBe('n3')
    expect(el.style.getPropertyValue('--a63-surface-tint')).toBe('40%')
    expect(el.getAttribute('data-a63-type-scale')).toBe('comfortable')
    expect(el.getAttribute('data-a63-radius')).toBe('round')
    expect(el.getAttribute('data-a63-font')).toBe('mono')
    expect(el.getAttribute('data-a63-os')).toBe('macos')
    expect(el.getAttribute('data-a63-icon-theme')).toBe('primary')
  })

  it('sets data-a63-theme for every theme incl. modern (attr-scoped overrides)', () => {
    const el = document.documentElement
    // Modern's tactile overrides live under [data-a63-theme="modern"] in the DS,
    // so the attr must be present (removing it would flatten modern to base).
    applyPersonalization({ ...FULL, theme: 'modern' })
    expect(el.getAttribute('data-a63-theme')).toBe('modern')
  })

  it('toggles the light/dark class + mode attr per mode', () => {
    const el = document.documentElement
    applyPersonalization({ ...FULL, mode: 'light' })
    expect(el.classList.contains('light')).toBe(true)
    expect(el.classList.contains('dark')).toBe(false)
    expect(el.getAttribute('data-a63-mode')).toBe('light')
  })

  it('clamps surfaceTint into 0–100%', () => {
    const el = document.documentElement
    applyPersonalization({ ...FULL, surfaceTint: 150 })
    expect(el.style.getPropertyValue('--a63-surface-tint')).toBe('100%')
    applyPersonalization({ ...FULL, surfaceTint: -10 })
    expect(el.style.getPropertyValue('--a63-surface-tint')).toBe('0%')
  })

  it('sets brand=auto attribute WITHOUT deriving the ramp (controller owns that)', () => {
    const el = document.documentElement
    applyPersonalization({ ...FULL, brand: 'auto' })
    expect(el.getAttribute('data-a63-brand')).toBe('auto')
    expect(el.style.getPropertyValue('--color-auto-500')).toBe('')
  })

  it('NEVER writes the legacy inline shadow tokens', () => {
    const el = document.documentElement
    applyPersonalization(FULL)
    expect(el.style.getPropertyValue('--primary')).toBe('')
    expect(el.style.getPropertyValue('--primary-foreground')).toBe('')
    expect(el.style.getPropertyValue('--surface-light-1')).toBe('')
    expect(el.style.getPropertyValue('--surface-dark-1')).toBe('')
  })
})
