import { textareaContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

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

  it('caps auto-grow at maxRows', () => {
    const { container } = render(<Textarea maxRows={4} style={{ color: 'inherit' }} />)
    const field = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(field?.style.getPropertyValue('--textarea-max-rows')).toBe('4')
    expect(field?.style.color).toBe('inherit')
  })

  it('takes the variant axis, defaulting to the contract default', () => {
    const { container, rerender } = render(<Textarea />)
    const control = () => container.querySelector('.a63-Textarea')
    expect(control()).toHaveAttribute('data-variant', textareaContract.defaultVariant)
    for (const variant of textareaContract.variants) {
      rerender(<Textarea variant={variant} />)
      expect(control()).toHaveAttribute('data-variant', variant)
    }
  })

  it('forwards the ref to the native textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea aria-label="Notes" ref={ref} />)
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Notes' }))
  })

  it('shows a controlled value and reports edits through onChange', async () => {
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState('Draft')
      return (
        <Textarea
          aria-label="Notes"
          onChange={event => {
            onChange(event.target.value)
            setValue(event.target.value.toUpperCase())
          }}
          value={value}
        />
      )
    }
    render(<Controlled />)
    const field = screen.getByRole('textbox', { name: 'Notes' })
    expect(field).toHaveValue('Draft')
    await userEvent.type(field, 's')
    expect(onChange).toHaveBeenLastCalledWith('Drafts')
    expect(field).toHaveValue('DRAFTS')
  })
})
