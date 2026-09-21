import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from './menubar'

function Example() {
  return (
    <Menubar>
      <MenubarMenu defaultOpen>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Actions</MenubarLabel>
          <MenubarItem>
            New
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarCheckboxItem checked>Autosave</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

describe('Menubar', () => {
  it('renders the bar and trigger with their slots', () => {
    const { container } = render(<Example />)
    expect(container.querySelector('[data-slot="menubar"]')).toHaveClass('a63-Menubar')
    const trigger = screen.getByText('File')
    expect(trigger).toHaveClass('a63-Menubar-trigger')
    expect(trigger).toHaveAttribute('data-slot', 'menubar-trigger')
  })

  it('renders the open popup and its parts', () => {
    render(<Example />)
    const content = document.querySelector('[data-slot="menubar-content"]')
    expect(content).not.toBeNull()
    expect(content).toHaveClass('a63-Menubar-content')
    expect(document.querySelector('[data-slot="menubar-label"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="menubar-separator"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="menubar-checkbox-item"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="menubar-shortcut"]')).not.toBeNull()
  })

  it('reflects the item variant', () => {
    render(<Example />)
    expect(screen.getByText('Delete')).toHaveAttribute('data-variant', 'destructive')
  })
})
