import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ToggleGroup, ToggleGroupItem, ToggleGroupSeparator } from './toggle-group'

describe('ToggleGroup', () => {
  it('renders a joined group with the default orientation', () => {
    const { container } = render(
      <ToggleGroup value={[]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    )
    const root = container.querySelector('[data-slot="toggle-group"]')
    expect(root).toHaveAttribute('data-orientation', 'horizontal')
    expect(root).not.toHaveAttribute('data-variant')
  })

  it('renders a separator', () => {
    const { container } = render(
      <ToggleGroup value={[]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupSeparator />
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(container.querySelector('[data-slot="toggle-group-separator"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="toggle-group-separator"]')).toHaveAttribute(
      'data-orientation',
      'vertical'
    )
  })

  it('orients a separator across a vertical group unless explicitly overridden', () => {
    const { container } = render(
      <ToggleGroup orientation="vertical" value={[]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupSeparator />
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(container.querySelector('[data-slot="toggle-group-separator"]')).toHaveAttribute(
      'data-orientation',
      'horizontal'
    )
  })

  it('single-select replaces the value', async () => {
    const onValueChange = vi.fn()
    render(
      <ToggleGroup onValueChange={onValueChange} value={['left']}>
        <ToggleGroupItem value="left">L</ToggleGroupItem>
        <ToggleGroupItem value="center">C</ToggleGroupItem>
      </ToggleGroup>
    )
    await userEvent.click(screen.getByRole('button', { name: 'C' }))
    expect(onValueChange).toHaveBeenCalled()
    expect(onValueChange.mock.calls[0][0]).toEqual(['center'])
  })

  it('multiple accumulates values', async () => {
    const onValueChange = vi.fn()
    render(
      <ToggleGroup multiple onValueChange={onValueChange} value={['left']}>
        <ToggleGroupItem value="left">L</ToggleGroupItem>
        <ToggleGroupItem value="center">C</ToggleGroupItem>
      </ToggleGroup>
    )
    await userEvent.click(screen.getByRole('button', { name: 'C' }))
    expect(onValueChange.mock.calls[0][0]).toEqual(['left', 'center'])
  })

  it('propagates size and tone to items; item props override', () => {
    render(
      <ToggleGroup size="lg" tone="accent" value={[]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem size="sm" value="b">
          B
        </ToggleGroupItem>
      </ToggleGroup>
    )
    const a = screen.getByRole('button', { name: 'A' })
    expect(a).toHaveAttribute('data-size', 'lg')
    expect(a).toHaveAttribute('data-tone', 'accent')
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('data-size', 'sm')
  })
})
