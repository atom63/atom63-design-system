import { kbdContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Kbd, KbdGroup } from './kbd'

describe('Kbd', () => {
  it('renders a <kbd> with the default size', () => {
    const { container } = render(<Kbd>K</Kbd>)
    const el = container.querySelector('kbd')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'kbd')
    expect(el).toHaveAttribute('data-size', kbdContract.defaultSize)
    expect(el).toHaveTextContent('K')
  })

  it('applies the given size', () => {
    const { container } = render(<Kbd size="sm">S</Kbd>)
    expect(container.querySelector('kbd')).toHaveAttribute('data-size', 'sm')
  })
})

describe('KbdGroup', () => {
  it('wraps its keys in a group', () => {
    const { container } = render(
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    )
    expect(container.querySelector('[data-slot="kbd-group"]')).not.toBeNull()
    expect(screen.getByText('⌘')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })
})
