import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Radio, RadioGroup, RadioGroupItem } from './radio'

describe('RadioGroup', () => {
  it('renders the group wrapper', () => {
    const { container } = render(
      <RadioGroup>
        <Radio value="a" />
      </RadioGroup>
    )
    const group = container.querySelector('.a63-RadioGroup')
    expect(group).not.toBeNull()
    expect(group).toHaveAttribute('data-slot', 'radio-group')
  })

  it('renders a radio with default size + role, and checks the selected value', () => {
    const { container } = render(
      <RadioGroup defaultValue="b">
        <Radio value="a" />
        <Radio value="b" />
      </RadioGroup>
    )
    const radios = container.querySelectorAll('.a63-Radio')
    expect(radios).toHaveLength(2)
    expect(radios[0]).toHaveAttribute('data-slot', 'radio')
    expect(radios[0]).toHaveAttribute('data-size', 'md')
    expect(radios[0]).toHaveAttribute('role', 'radio')
    expect(radios[1]).toHaveAttribute('data-checked')
    expect(radios[0]).not.toHaveAttribute('data-checked')
  })

  it('applies size + disabled', () => {
    const { container } = render(
      <RadioGroup>
        <Radio disabled size="sm" value="a" />
      </RadioGroup>
    )
    const radio = container.querySelector('.a63-Radio')
    expect(radio).toHaveAttribute('data-size', 'sm')
    expect(radio).toHaveAttribute('data-disabled')
  })

  it('forwards invalid state to the interactive radio', () => {
    const { container } = render(
      <RadioGroup>
        <Radio aria-invalid="true" value="a" />
      </RadioGroup>
    )

    expect(container.querySelector('.a63-Radio')).toHaveAttribute('aria-invalid', 'true')
  })

  it('RadioGroupItem is the Radio alias', () => {
    expect(RadioGroupItem).toBe(Radio)
  })
})
