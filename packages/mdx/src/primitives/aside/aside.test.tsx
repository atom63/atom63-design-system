import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Aside } from './aside'

describe('Aside', () => {
  it('renders a complementary landmark defaulting to the right margin', () => {
    render(<Aside>note</Aside>)
    const el = screen.getByRole('complementary')
    expect(el).toHaveTextContent('note')
    expect(el).toHaveAttribute('data-aside-side', 'right')
    expect(el.className).toContain('xl:float-right')
  })

  it('supports the left margin', () => {
    render(<Aside side="left">n</Aside>)
    const el = screen.getByRole('complementary')
    expect(el).toHaveAttribute('data-aside-side', 'left')
    expect(el.className).toContain('xl:float-left')
  })
})
