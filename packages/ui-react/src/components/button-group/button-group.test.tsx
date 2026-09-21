import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '../button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group'
import { ButtonGroupProvider, useButtonGroupContext } from './button-group-context'

describe('ButtonGroup', () => {
  it('renders the group with slot + default orientation/size', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    )
    const el = container.querySelector('.a63-ButtonGroup')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'button-group')
    expect(el).toHaveAttribute('data-orientation', 'horizontal')
    expect(el).toHaveAttribute('data-size', 'default')
    expect(el).toHaveAttribute('role', 'group')
  })

  it('forwards orientation + size to data attributes', () => {
    const { container } = render(
      <ButtonGroup orientation="vertical" size="icon-sm">
        <Button>One</Button>
      </ButtonGroup>
    )
    const el = container.querySelector('.a63-ButtonGroup')
    expect(el).toHaveAttribute('data-orientation', 'vertical')
    expect(el).toHaveAttribute('data-size', 'icon-sm')
  })

  it('renders a text cell and a separator', () => {
    const { container } = render(
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <ButtonGroupSeparator />
        <Button>Go</Button>
      </ButtonGroup>
    )
    const text = container.querySelector('.a63-ButtonGroup-text')
    expect(text).toHaveAttribute('data-slot', 'button-group-text')
    expect(text).toHaveTextContent('https://')
    const sep = container.querySelector('.a63-ButtonGroup-separator')
    expect(sep).toHaveAttribute('data-slot', 'button-group-separator')
    expect(sep).toHaveAttribute('data-orientation', 'vertical')
  })

  it('ButtonGroupText render prop swaps the element', () => {
    const { container } = render(<ButtonGroupText render={<span />}>Label</ButtonGroupText>)
    const el = container.querySelector('.a63-ButtonGroup-text')
    expect(el?.tagName).toBe('SPAN')
  })

  it('context is false outside a group and true inside the provider', () => {
    function Probe() {
      return <span data-testid="probe">{String(useButtonGroupContext())}</span>
    }
    // Bound queries hit document.body, so scope each render to its own container.
    const outside = render(<Probe />)
    expect(within(outside.container).getByTestId('probe')).toHaveTextContent('false')

    const inside = render(
      <ButtonGroupProvider>
        <Probe />
      </ButtonGroupProvider>
    )
    expect(within(inside.container).getByTestId('probe')).toHaveTextContent('true')
  })
})
