import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
} from './command'

// Base UI waits for scroll-area animations before measuring. jsdom does not
// implement the Web Animations API, so this file exposes the no-animation case.
Element.prototype.getAnimations ??= () => []

type Item = { id: string; label: string }
const groups = [
  {
    id: 'nav',
    label: 'Navigate',
    items: [
      { id: 'home', label: 'Home' },
      { id: 'blog', label: 'Blog' },
    ] as Item[],
  },
]

function Fixture({ onPick }: { onPick?: (item: Item) => void }) {
  return (
    <Command itemToStringValue={item => (item as Item).label} items={groups}>
      <CommandInput placeholder="Search…" />
      <CommandPanel>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandList>
          {(group: (typeof groups)[number]) => (
            <CommandGroup items={group.items} key={group.id}>
              <CommandGroupLabel>{group.label}</CommandGroupLabel>
              <CommandCollection>
                {(item: Item) => (
                  <CommandItem key={item.id} onClick={() => onPick?.(item)} value={item}>
                    {item.label}
                  </CommandItem>
                )}
              </CommandCollection>
            </CommandGroup>
          )}
        </CommandList>
      </CommandPanel>
    </Command>
  )
}

describe('Command', () => {
  it('renders the search input', () => {
    const { container } = render(<Fixture />)
    const input = container.querySelector('[data-slot="command-input"]')
    expect(input).not.toBeNull()
    expect(input).toHaveAttribute('placeholder', 'Search…')
  })

  it('renders the items from the items prop', () => {
    const { getByText } = render(<Fixture />)
    expect(getByText('Home')).toBeInTheDocument()
    expect(getByText('Blog')).toBeInTheDocument()
    expect(getByText('Navigate')).toBeInTheDocument()
  })

  it('replaces the input icon and renders an end addon', () => {
    const { container, rerender } = render(
      <Command items={[]}>
        <CommandInput endAddon={<kbd>F</kbd>} icon={<svg data-testid="custom-icon" />} />
      </Command>
    )
    expect(container.querySelector('[data-testid="custom-icon"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="command-input-end"]')).toHaveTextContent('F')
    rerender(
      <Command items={[]}>
        <CommandInput icon={null} />
      </Command>
    )
    expect(container.querySelector('.a63-Command-input-icon')).toBeNull()
    expect(container.querySelector('[data-slot="command-input-end"]')).toBeNull()
  })

  it('filters the items as you type and shows the empty state when none match', async () => {
    const user = userEvent.setup()
    render(<Fixture />)
    const input = screen.getByRole('combobox')

    await user.type(input, 'bl')
    expect(screen.getByRole('option', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.queryByText('No results.')).not.toBeInTheDocument()

    await user.type(input, 'zzz')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('moves the highlight with the arrow keys and picks the item on Enter', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<Fixture onPick={onPick} />)
    const input = screen.getByRole('combobox')
    await user.click(input)

    // autoHighlight="always" highlights the first item; ArrowDown moves to the next.
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Home' })).toHaveAttribute('data-highlighted')
    )
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Blog' })).toHaveAttribute('data-highlighted')
    await user.keyboard('{Enter}')
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: 'blog' }))
  })

  it('opens from its trigger and closes on Escape, returning focus to the trigger', async () => {
    const user = userEvent.setup()
    render(
      <CommandDialog>
        <CommandDialogTrigger>Open palette</CommandDialogTrigger>
        <CommandDialogPopup>
          <Fixture />
        </CommandDialogPopup>
      </CommandDialog>
    )
    const trigger = screen.getByRole('button', { name: 'Open palette' })
    await user.click(trigger)
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus())

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
    })
  })

  it('names the dialog with `title`, or leaves the name to aria-label', async () => {
    const { unmount } = render(
      <CommandDialog open>
        <CommandDialogPopup title="Search the docs">
          <Fixture />
        </CommandDialogPopup>
      </CommandDialog>
    )
    expect(await screen.findByRole('dialog', { name: 'Search the docs' })).toBeInTheDocument()
    unmount()
    render(
      <CommandDialog open>
        <CommandDialogPopup aria-label="Jump to">
          <Fixture />
        </CommandDialogPopup>
      </CommandDialog>
    )
    const dialog = await screen.findByRole('dialog', { name: 'Jump to' })
    expect(dialog).not.toHaveAttribute('aria-labelledby')
  })

  it('marks a modal dialog aria-modal, and a non-modal one not', async () => {
    const { unmount } = render(
      <CommandDialog open>
        <CommandDialogPopup>
          <Fixture />
        </CommandDialogPopup>
      </CommandDialog>
    )
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    unmount()
    render(
      <CommandDialog modal={false} open>
        <CommandDialogPopup>
          <Fixture />
        </CommandDialogPopup>
      </CommandDialog>
    )
    expect(await screen.findByRole('dialog')).not.toHaveAttribute('aria-modal')
  })

  it('names the input by default, by `label`, or by aria-label', () => {
    const { unmount } = render(<Fixture />)
    expect(screen.getByRole('combobox', { name: 'Search commands' })).toBeInTheDocument()
    unmount()
    const { unmount: unmountLabel } = render(
      <Command items={[]}>
        <CommandInput label="Find a page" placeholder="Search…" />
      </Command>
    )
    expect(screen.getByRole('combobox', { name: 'Find a page' })).toBeInTheDocument()
    unmountLabel()
    render(
      <Command items={[]}>
        <span id="palette-label">Jump to</span>
        <CommandInput aria-labelledby="palette-label" placeholder="Search…" />
      </Command>
    )
    const input = screen.getByRole('combobox', { name: 'Jump to' })
    expect(input).not.toHaveAttribute('aria-label')
  })
})
