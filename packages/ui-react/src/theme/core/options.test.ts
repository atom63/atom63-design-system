import { describe, expect, it } from 'vitest'
import {
  BRAND_OPTIONS,
  FONT_OPTIONS,
  ICON_THEME_OPTIONS,
  MODE_OPTIONS,
  OS_OPTIONS,
  RADIUS_OPTIONS,
  SURFACE_OPTIONS,
  THEME_OPTIONS,
  TYPE_SCALE_OPTIONS,
} from './options'

describe('personalization option catalogs', () => {
  it('labels the retro theme "Retro"', () => {
    const retro = THEME_OPTIONS.find(o => o.id === 'retro')
    expect(retro).toBeDefined()
    expect(retro?.name).toBe('Retro')
    expect(THEME_OPTIONS.some(o => (o.id as string) === 'y2k')).toBe(false)
  })

  it('exposes the full axis value sets', () => {
    expect(MODE_OPTIONS.map(o => o.id)).toEqual(['light', 'dark', 'system'])
    expect(THEME_OPTIONS.map(o => o.id)).toEqual(['modern', 'aqua', 'retro', 'terminal'])
    expect(BRAND_OPTIONS.map(o => o.id)).toEqual(['auto', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6'])
    expect(SURFACE_OPTIONS.map(o => o.id)).toEqual(['n1', 'n2', 'n3', 'n4', 'n5', 'n6'])
    expect(TYPE_SCALE_OPTIONS.map(o => o.id)).toEqual(['compact', 'normal', 'comfortable', 'large'])
    expect(RADIUS_OPTIONS.map(o => o.id)).toEqual(['none', 'subtle', 'default', 'round'])
    expect(FONT_OPTIONS.map(o => o.id)).toEqual(['sans', 'serif', 'mono', 'pixel'])
    expect(OS_OPTIONS.map(o => o.id)).toEqual(['macos', 'windows'])
    expect(ICON_THEME_OPTIONS.map(o => o.id)).toEqual(['realistic', 'color', 'neutral', 'primary'])
  })
})
