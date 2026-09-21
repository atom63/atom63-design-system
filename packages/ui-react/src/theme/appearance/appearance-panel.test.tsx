import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AppearancePanel } from './appearance-panel'
import type { PersonalizationController, PersonalizationState } from '../core/types'

const STATE: PersonalizationState = {
  mode: 'dark',
  theme: 'modern',
  brand: 'b1',
  surface: 'n1',
  surfaceTint: 0,
  typeScale: 'normal',
  radius: 'default',
  font: 'sans',
  os: 'macos',
  iconTheme: 'realistic',
  wallpaper: null,
}

function makeController(
  overrides: Partial<PersonalizationController> = {}
): PersonalizationController {
  return {
    state: STATE,
    setMode: vi.fn(),
    setTheme: vi.fn(),
    setBrand: vi.fn(),
    setSurface: vi.fn(),
    setSurfaceTint: vi.fn(),
    setTypeScale: vi.fn(),
    setRadius: vi.fn(),
    setFont: vi.fn(),
    setOs: vi.fn(),
    setIconTheme: vi.fn(),
    setWallpaper: vi.fn(),
    update: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  }
}

describe('AppearancePanel', () => {
  it('renders a section per default axis with its title', () => {
    render(<AppearancePanel controller={makeController()} />)
    // Visual-card axes render the title twice (visible section span + the
    // control's sr-only <legend>), so assert "at least one".
    for (const title of ['Mode', 'Theme', 'Primary', 'Surface', 'Type scale', 'Radius', 'Font']) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0)
    }
  })

  it('drives the controller setter for an axis', () => {
    const setTheme = vi.fn()
    render(<AppearancePanel controller={makeController({ setTheme })} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Aqua' }))
    expect(setTheme).toHaveBeenCalledWith('aqua')
  })

  it('honors the sections allowlist', () => {
    render(<AppearancePanel controller={makeController()} sections={['mode', 'theme']} />)
    expect(screen.getAllByText('Mode').length).toBeGreaterThan(0)
    expect(screen.queryByText('Radius')).toBeNull()
  })
})
