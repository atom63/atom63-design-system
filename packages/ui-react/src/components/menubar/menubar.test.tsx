import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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

function Interactive({ onNew }: { onNew?: () => void }) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNew}>New</MenubarItem>
          <MenubarItem>Open</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const trigger = (name: string) => screen.getByRole('menuitem', { name })
const menu = () => screen.queryByRole('menu')

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

  it('exposes a menubar whose triggers are one tab stop with roving focus', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    expect(screen.getByRole('menubar')).toBeInTheDocument()
    await user.tab()
    expect(trigger('File')).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(trigger('Edit')).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(trigger('File')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(trigger('Edit')).toHaveFocus()
    await user.tab()
    expect(document.body).toHaveFocus()
  })

  it('opens a menu with ArrowDown and focuses its first item', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.tab()
    await user.keyboard('{ArrowDown}')
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'true')
    const first = await screen.findByRole('menuitem', { name: 'New' })
    await waitFor(() => expect(first).toHaveFocus())
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus()
  })

  // With a menu open, ArrowRight and ArrowLeft open the neighbouring menu (wrapping at the
  // ends) and close the current one. Base UI focuses the new menu's popup, so ArrowDown then
  // reaches its first item.
  it('opens the next menu with ArrowRight while a menu is open', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.tab()
    await user.keyboard('{ArrowDown}')
    const newItem = await screen.findByRole('menuitem', { name: 'New' })
    await waitFor(() => expect(newItem).toHaveFocus())

    await user.keyboard('{ArrowRight}')
    expect(await screen.findByRole('menuitem', { name: 'Undo' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'New' })).toBeNull())
    expect(trigger('Edit')).toHaveAttribute('aria-expanded', 'true')
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => expect(screen.getByRole('menu')).toHaveFocus())
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveFocus()
  })

  it('opens the previous menu with ArrowLeft while a menu is open, wrapping at the start', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.tab()
    await user.keyboard('{ArrowDown}')
    const newItem = await screen.findByRole('menuitem', { name: 'New' })
    await waitFor(() => expect(newItem).toHaveFocus())

    await user.keyboard('{ArrowLeft}')
    expect(await screen.findByRole('menuitem', { name: 'Undo' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'New' })).toBeNull())
    expect(trigger('Edit')).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.click(trigger('File'))
    await screen.findByRole('menuitem', { name: 'New' })
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(menu()).toBeNull()
      expect(trigger('File')).toHaveFocus()
    })
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'false')
  })

  it('runs an item once and closes the menu when it is clicked', async () => {
    const user = userEvent.setup()
    const onNew = vi.fn()
    render(<Interactive onNew={onNew} />)
    await user.click(trigger('File'))
    await user.click(await screen.findByRole('menuitem', { name: 'New' }))
    expect(onNew).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(menu()).toBeNull())
  })
})
