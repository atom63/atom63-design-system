import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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

  it('portals into portalProps.container when no portalContainer is given', () => {
    const host = document.createElement('div')
    document.body.append(host)

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent portalProps={{ container: host }}>
          <DropdownMenuItem>Email</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(host.querySelector('[data-slot="dropdown-menu-content"]')).not.toBeNull()
    host.remove()
  })

  it('marks the checked checkbox and the selected radio item', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem defaultChecked>Grid</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Rulers</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup defaultValue="name">
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(screen.getByRole('menuitemcheckbox', { name: 'Grid' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rulers' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
    expect(screen.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('does not fire onClick on a disabled item', async () => {
    const user = userEvent.setup()
    const onDisabled = vi.fn()
    const onEnabled = vi.fn()

    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onClick={onDisabled}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEnabled}>Copy</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    await user.click(screen.getByText('Duplicate'))
    expect(onDisabled).not.toHaveBeenCalled()
    await user.click(screen.getByText('Copy'))
    expect(onEnabled).toHaveBeenCalledTimes(1)
  })
})
