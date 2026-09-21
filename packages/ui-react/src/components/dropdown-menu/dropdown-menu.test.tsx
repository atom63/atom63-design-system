import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

function Example() {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Section</DropdownMenuLabel>
        <DropdownMenuItem>
          Copy
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Show grid</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('renders the trigger with its slot', () => {
    render(<Example />)
    const trigger = screen.getByText('Open')
    expect(trigger).toHaveClass('a63-Menu-trigger')
    expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger')
  })

  it('renders the open popup + its parts', () => {
    render(<Example />)
    const popup = document.querySelector('[data-slot="dropdown-menu-content"]')
    expect(popup).not.toBeNull()
    expect(popup).toHaveClass('a63-Menu-popup')
    expect(document.querySelector('[data-slot="dropdown-menu-label"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="dropdown-menu-separator"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="dropdown-menu-shortcut"]')).not.toBeNull()
  })

  it('reflects the item variant', () => {
    render(<Example />)
    const destructive = screen.getByText('Delete')
    expect(destructive).toHaveAttribute('data-variant', 'destructive')
  })

  it('portals submenu content into the requested container', () => {
    const portalContainer = document.createElement('div')
    document.body.append(portalContainer)

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub defaultOpen>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent portalContainer={portalContainer}>
              <DropdownMenuItem>Email</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(
      portalContainer.querySelector('[data-slot="dropdown-menu-sub-positioner"]')
    ).not.toBeNull()
    expect(portalContainer).toHaveTextContent('Email')
    portalContainer.remove()
  })
})
