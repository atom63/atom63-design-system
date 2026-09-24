import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stack } from './stack'

describe('Stack', () => {
  it('renders a vertical flex column with the default gap', () => {
    render(<Stack>content</Stack>)
    const el = screen.getByText('content')
    expect(el).toHaveAttribute('data-stack-gap', 'md')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-col')
    expect(el.className).toContain('gap-6')
  })

  it('maps the sm and lg gaps', () => {
    const { rerender } = render(<Stack gap="sm">s</Stack>)
    expect(screen.getByText('s').className).toContain('gap-3')
    rerender(<Stack gap="lg">l</Stack>)
    expect(screen.getByText('l').className).toContain('gap-10')
  })
})
