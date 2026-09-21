import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './context-menu'

/*
 * ContextMenu opens on right-click, so there is no defaultOpen. We drive the
 * open state with the controlled `open` prop to keep the render jsdom-minimal.
 */
function Example() {
  return (
    <ContextMenu open>
      <ContextMenuTrigger>Target</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Section</ContextMenuLabel>
        <ContextMenuItem>
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuCheckboxItem checked>Show grid</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

describe('ContextMenu', () => {
  it('renders the trigger with its slot', () => {
    render(<Example />)
    const trigger = screen.getByText('Target')
    expect(trigger).toHaveClass('a63-Menu-trigger')
    expect(trigger).toHaveAttribute('data-slot', 'context-menu-trigger')
  })

  it('renders the open popup + its parts', () => {
    render(<Example />)
    const popup = document.querySelector('[data-slot="context-menu-content"]')
    expect(popup).not.toBeNull()
    expect(popup).toHaveClass('a63-Menu-popup')
    expect(document.querySelector('[data-slot="context-menu-label"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="context-menu-separator"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="context-menu-checkbox-item"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="context-menu-shortcut"]')).not.toBeNull()
  })

  it('reflects the item variant', () => {
    render(<Example />)
    const destructive = screen.getByText('Delete')
    expect(destructive).toHaveAttribute('data-variant', 'destructive')
  })
})
