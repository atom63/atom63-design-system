import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Bleed } from './bleed'

describe('Bleed', () => {
  it('breaks out to the full viewport width', () => {
    render(<Bleed>full</Bleed>)
    const el = screen.getByText('full')
    expect(el).toHaveAttribute('data-bleed')
    expect(el.className).toContain('w-screen')
    expect(el.className).toContain('left-1/2')
  })
})
