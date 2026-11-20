import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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

/*
 * Uncontrolled, as products use it. The trigger is focusable so the keyboard
 * path can be exercised: browsers fire `contextmenu` on the focused element for
 * Shift+F10 and the ContextMenu key, which jsdom cannot synthesise from a key
 * press, so the tests dispatch that event directly.
 */
function Interactive({ onCopy }: { onCopy?: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger tabIndex={0}>Target</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onCopy}>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const menu = () => screen.queryByRole('menu')
const item = (name: string) => screen.getByRole('menuitem', { name })

/** Right-clicks the trigger and waits for the popup to take focus, as it does before keys reach it. */
async function openMenu() {
  fireEvent.contextMenu(screen.getByText('Target'))
  const popup = await screen.findByRole('menu')
  await waitFor(() => expect(popup).toHaveFocus())
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

  it('opens on right-click and suppresses the native menu', async () => {
    render(<Interactive />)
    expect(menu()).toBeNull()
    const notPrevented = fireEvent.contextMenu(screen.getByText('Target'), {
      clientX: 40,
      clientY: 60,
    })
    expect(notPrevented).toBe(false)
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Target')).toHaveAttribute('data-popup-open')
  })

  it('opens from the keyboard context-menu event on the focused trigger and focuses the menu', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.tab()
    const trigger = screen.getByText('Target')
    expect(trigger).toHaveFocus()
    fireEvent.contextMenu(trigger)
    const popup = await screen.findByRole('menu')
    await waitFor(() => expect(popup).toHaveFocus())
  })

  it('moves between items with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await openMenu()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(item('Copy')).toHaveFocus())
    await user.keyboard('{ArrowDown}')
    expect(item('Paste')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(item('Copy')).toHaveFocus()
  })

  it('runs an item once and closes when it is activated with Enter', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(<Interactive onCopy={onCopy} />)
    await openMenu()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(item('Copy')).toHaveFocus())
    await user.keyboard('{Enter}')
    expect(onCopy).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(menu()).toBeNull())
  })

  it('runs an item once and closes when it is clicked', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(<Interactive onCopy={onCopy} />)
    fireEvent.contextMenu(screen.getByText('Target'))
    await user.click(await screen.findByRole('menuitem', { name: 'Copy' }))
    expect(onCopy).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(menu()).toBeNull())
  })

  it('dismisses on Escape and returns focus to the focused trigger', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    await user.tab()
    await openMenu()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(menu()).toBeNull())
    expect(screen.getByText('Target')).toHaveFocus()
  })

  it('dismisses on an outside click', async () => {
    const user = userEvent.setup()
    render(<Interactive />)
    fireEvent.contextMenu(screen.getByText('Target'))
    await screen.findByRole('menu')
    await user.click(document.body)
    await waitFor(() => expect(menu()).toBeNull())
  })
})
