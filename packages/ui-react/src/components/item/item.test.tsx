import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './item'

describe('Item', () => {
  it('renders the container with slot + default variant/size', () => {
    const { container } = render(<Item>row</Item>)
    const el = container.querySelector('.a63-Item')
    expect(el).not.toBeNull()
    expect(el?.tagName).toBe('DIV')
    expect(el).toHaveAttribute('data-slot', 'item')
    expect(el).toHaveAttribute('data-variant', 'default')
    expect(el).toHaveAttribute('data-size', 'default')
  })

  it('forwards variant + size', () => {
    const { container } = render(
      <Item variant="outline" size="sm">
        row
      </Item>
    )
    const el = container.querySelector('.a63-Item')
    expect(el).toHaveAttribute('data-variant', 'outline')
    expect(el).toHaveAttribute('data-size', 'sm')
  })

  it('render prop swaps the container to an anchor', () => {
    const { container } = render(<Item render={<a href="/x">link row</a>} />)
    const el = container.querySelector('.a63-Item')
    expect(el?.tagName).toBe('A')
    expect(el).toHaveAttribute('href', '/x')
    expect(el).toHaveAttribute('data-slot', 'item')
  })

  it('composes media/content/title/description/actions', () => {
    const { container } = render(
      <Item>
        <ItemMedia variant="icon">*</ItemMedia>
        <ItemContent>
          <ItemTitle>Title</ItemTitle>
          <ItemDescription>Desc</ItemDescription>
        </ItemContent>
        <ItemActions>
          <button type="button">Go</button>
        </ItemActions>
      </Item>
    )
    expect(container.querySelector('.a63-ItemMedia')).toHaveAttribute('data-variant', 'icon')
    expect(container.querySelector('.a63-ItemContent')).toHaveAttribute('data-slot', 'item-content')
    expect(container.querySelector('.a63-ItemTitle')).toHaveTextContent('Title')
    const desc = container.querySelector('.a63-ItemDescription')
    expect(desc?.tagName).toBe('P')
    expect(container.querySelector('.a63-ItemActions')).toHaveAttribute('data-slot', 'item-actions')
  })

  it('renders group/header/footer/separator slots', () => {
    const { container } = render(
      <ItemGroup>
        <Item>
          <ItemHeader>h</ItemHeader>
          <ItemFooter>f</ItemFooter>
        </Item>
        <ItemSeparator />
      </ItemGroup>
    )
    expect(container.querySelector('.a63-ItemGroup')).toHaveAttribute('data-slot', 'item-group')
    expect(container.querySelector('.a63-ItemHeader')).toHaveAttribute('data-slot', 'item-header')
    expect(container.querySelector('.a63-ItemFooter')).toHaveAttribute('data-slot', 'item-footer')
    expect(container.querySelector('.a63-ItemSeparator')).toHaveAttribute(
      'data-slot',
      'item-separator'
    )
  })
})
