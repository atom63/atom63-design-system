import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { ColorSwatchItem } from './color-swatch-item'

describe('ColorSwatchItem', () => {
  it('shows the name and the variable, and paints the swatch from the variable', () => {
    const { container } = render(
      <ColorSwatchItem name="Page surface" variable="--a63-surface-page" />
    )

    expect(screen.getByText('Page surface')).toBeInTheDocument()
    expect(screen.getByText('--a63-surface-page')).toBeInTheDocument()
    const swatch = container.querySelector('.mdx-color-swatch-frame > div') as HTMLElement
    expect(swatch.style.backgroundColor).toBe('var(--a63-surface-page)')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ColorSwatchItem name="Page surface" variable="--a63-surface-page" />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
