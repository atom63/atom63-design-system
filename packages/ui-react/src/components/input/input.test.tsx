import { inputContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Input } from './input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group'

describe('Input', () => {
  it('renders a textbox inside the control wrapper', () => {
    const { container } = render(<Input placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="input-control"]')).not.toBeNull()
  })

  it('falls back to the contract default size', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('[data-slot="input-control"]')).toHaveAttribute(
      'data-size',
      inputContract.defaultSize
    )
  })

  it('reflects invalid and disabled on the control and syncs aria-invalid', () => {
    const { container } = render(<Input disabled invalid />)
    const control = container.querySelector('[data-slot="input-control"]')
    expect(control).toHaveAttribute('data-invalid', '')
    expect(control).toHaveAttribute('data-disabled', '')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('treats aria-invalid as invalid chrome', () => {
    const { container } = render(<Input aria-invalid />)
    expect(container.querySelector('[data-slot="input-control"]')).toHaveAttribute(
      'data-invalid',
      ''
    )
  })

  it('nativeInput prop renders a plain input', () => {
    const { container } = render(<Input nativeInput placeholder="Native" />)
    const input = container.querySelector('input')
    expect(input).not.toBeNull()
    expect(input).toHaveAttribute('data-slot', 'input')
  })
})

describe('InputGroup', () => {
  it('composes an unstyled field with a text addon', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupText>https://</InputGroupText>
        <InputGroupInput placeholder="site" />
      </InputGroup>
    )
    expect(screen.getByText('https://')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('site')).toBeInTheDocument()
    expect(container.querySelector('[data-unstyled]')).not.toBeNull()
  })

  it('exposes role=group like @atom63/ui', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput placeholder="site" />
      </InputGroup>
    )
    expect(container.querySelector('[data-slot="input-group"]')).toHaveAttribute('role', 'group')
  })

  it('propagates invalid from the group to the nested input', () => {
    render(
      <InputGroup invalid>
        <InputGroupInput placeholder="site" />
      </InputGroup>
    )
    expect(screen.getByPlaceholderText('site')).toHaveAttribute('aria-invalid', 'true')
  })

  it('focuses the field when clicking a non-interactive addon', async () => {
    const user = userEvent.setup()
    render(
      <InputGroup>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput placeholder="handle" />
      </InputGroup>
    )
    await user.click(screen.getByText('@'))
    expect(screen.getByPlaceholderText('handle')).toHaveFocus()
  })

  it('supports block-aligned textarea composition', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupAddon align="block-start">Comment</InputGroupAddon>
        <InputGroupTextarea aria-label="Comment" placeholder="Note" />
      </InputGroup>
    )
    expect(container.querySelector('[data-align="block-start"]')).not.toBeNull()
    expect(screen.getByPlaceholderText('Note').tagName).toBe('TEXTAREA')
  })

  it('propagates invalid from the group to a nested textarea', () => {
    render(
      <InputGroup invalid>
        <InputGroupTextarea aria-label="Comment" />
      </InputGroup>
    )
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('exposes the flat field treatment when shadow is disabled', () => {
    const { container } = render(
      <InputGroup shadow={false}>
        <InputGroupInput aria-label="Search" />
      </InputGroup>
    )
    expect(container.querySelector('[data-slot="input-group"]')).toHaveAttribute(
      'data-shadow',
      'false'
    )
  })
})
