import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Section } from './section'

describe('Section', () => {
  it('renders children and defaults to the column width mode', () => {
    render(<Section>hello</Section>)
    const el = screen.getByText('hello')
    expect(el).toHaveAttribute('data-mdx-width', 'column')
    expect(el).toHaveAttribute('data-section-width', 'column')
    expect(el.className).toContain('max-w-[var(--mdx-measure,42rem)]')
  })

  it('applies the bleed width mode', () => {
    render(<Section width="bleed">wide</Section>)
    const el = screen.getByText('wide')
    expect(el).toHaveAttribute('data-mdx-width', 'bleed')
    expect(el).toHaveAttribute('data-section-width', 'bleed')
    expect(el.className).toContain('max-w-none')
  })

  it('merges a custom className', () => {
    render(
      <Section className="custom-x" width="wide">
        w
      </Section>
    )
    expect(screen.getByText('w').className).toContain('custom-x')
  })
})
