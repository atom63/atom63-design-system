import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a control wrapper around a <textarea>', () => {
    const { container } = render(<Textarea placeholder="Notes" />)
    const control = container.querySelector('.a63-Textarea')
    expect(control).toHaveAttribute('data-slot', 'textarea-control')
    const field = container.querySelector('.a63-Textarea-field')
    expect(field?.tagName).toBe('TEXTAREA')
    expect(field).toHaveAttribute('data-slot', 'textarea')
    expect(screen.getByPlaceholderText('Notes')).toBe(field)
  })

  it('marks the control disabled when the field is disabled', () => {
    const { container } = render(<Textarea disabled />)
    expect(container.querySelector('.a63-Textarea')).toHaveAttribute('data-disabled', '')
    expect(container.querySelector('.a63-Textarea-field')).toBeDisabled()
  })

  it('drops the chrome when unstyled', () => {
    const { container } = render(<Textarea unstyled />)
    expect(container.querySelector('.a63-Textarea')).toHaveAttribute('data-unstyled', '')
  })

  it('exposes visual size, invalid, and flat-shadow states on the wrapper', () => {
    const { container } = render(<Textarea invalid shadow={false} size="lg" />)
    const control = container.querySelector('.a63-Textarea')
    expect(control).toHaveAttribute('data-invalid', '')
    expect(control).toHaveAttribute('data-shadow', 'false')
    expect(control).toHaveAttribute('data-size', 'lg')
    expect(container.querySelector('textarea')).toHaveAttribute('aria-invalid', 'true')
  })

  it('keeps wrapper and native-field classes separate', () => {
    const { container } = render(
      <Textarea className="control-class" textareaClassName="field-class" />
    )
    expect(container.querySelector('.a63-Textarea')).toHaveClass('control-class')
    expect(container.querySelector('textarea')).toHaveClass('field-class')
  })
})
