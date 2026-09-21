import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PanelSettingButton } from './panel-setting-button'

describe('PanelSettingButton', () => {
  it('renders a tile button with the icon + label and its slot', () => {
    const { container, getByText } = render(
      <PanelSettingButton icon={<svg data-testid="icon" />} label="Wallpaper" />
    )

    const el = container.querySelector('[data-trigger-slot="panel-setting-button"]')
    expect(el).not.toBeNull()
    expect(el).toHaveClass('a63-PanelSettingButton')
    expect(el?.tagName).toBe('BUTTON')
    expect(el).toHaveAttribute('data-variant', 'outline')
    expect(getByText('Wallpaper')).toHaveClass('a63-PanelSettingButton-label')
    expect(el?.querySelector('[data-testid="icon"]')).not.toBeNull()
  })

  it('reflects the active toggle state without using transient button press state', () => {
    const { container } = render(<PanelSettingButton active icon={<svg />} label="Theme" />)
    const el = container.querySelector('[data-trigger-slot="panel-setting-button"]')
    expect(el).toHaveAttribute('data-active', '')
    expect(el).toHaveAttribute('data-state', 'on')
    expect(el).toHaveAttribute('aria-pressed', 'true')
    expect(el).not.toHaveAttribute('data-pressed')
  })

  it('does not set data-active when inactive', () => {
    const { container } = render(<PanelSettingButton icon={<svg />} label="Theme" />)
    const el = container.querySelector('[data-trigger-slot="panel-setting-button"]')
    expect(el).not.toHaveAttribute('data-active')
    expect(el).toHaveAttribute('data-state', 'off')
    expect(el).toHaveAttribute('aria-pressed', 'false')
  })
})
