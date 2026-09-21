import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Label } from './label'

describe('Label', () => {
  it('renders a <label> with the data-slot', () => {
    const { container } = render(<Label>Email</Label>)
    const el = container.querySelector('.a63-Label')
    expect(el?.tagName).toBe('LABEL')
    expect(el).toHaveAttribute('data-slot', 'label')
    expect(el).toHaveTextContent('Email')
  })

  it('forwards htmlFor to associate with a control', () => {
    render(<Label htmlFor="email">Email</Label>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email')
  })

  it('merges custom className', () => {
    const { container } = render(<Label className="custom">X</Label>)
    const el = container.querySelector('.a63-Label')
    expect(el).toHaveClass('a63-Label', 'custom')
  })
})
