import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Grid } from './grid'

describe('Grid', () => {
  it('renders a single column by default and exposes the cols css var at md', () => {
    render(<Grid cols="1fr 2fr">cells</Grid>)
    const el = screen.getByText('cells')
    expect(el.className).toContain('grid')
    expect(el.className).toContain('grid-cols-1')
    expect(el.className).toContain('md:[grid-template-columns:var(--mdx-grid-cols)]')
    expect(el.getAttribute('style')).toContain('--mdx-grid-cols: 1fr 2fr')
  })

  it('defaults cols to two equal columns', () => {
    render(<Grid>c</Grid>)
    expect(screen.getByText('c').getAttribute('style')).toContain('--mdx-grid-cols: 1fr 1fr')
  })
})
