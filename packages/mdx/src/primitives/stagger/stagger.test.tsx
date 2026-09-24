import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getStaggerVariants, Stagger } from './stagger'

describe('getStaggerVariants', () => {
  it('disables the offset and stagger when reduced', () => {
    const v = getStaggerVariants(true)
    expect(v.item.hidden).toMatchObject({ opacity: 1, y: 0 })
    expect(v.container.visible.transition.staggerChildren).toBe(0)
  })

  it('staggers children when motion is allowed', () => {
    const v = getStaggerVariants(false)
    expect(v.item.hidden).toMatchObject({ opacity: 0 })
    expect(v.container.visible.transition.staggerChildren).toBeGreaterThan(0)
  })
})

describe('Stagger', () => {
  it('renders each child', () => {
    render(
      <Stagger>
        <span>a</span>
        <span>b</span>
      </Stagger>
    )
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })
})
