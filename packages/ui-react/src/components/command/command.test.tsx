import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Command,
  CommandCollection,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
} from './command'

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

function Fixture() {
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
                  <CommandItem key={item.id} value={item}>
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
})
