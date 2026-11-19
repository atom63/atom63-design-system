import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompleteSeparator,
  AutocompleteStatus,
} from './autocomplete'

const fruits = ['Apple', 'Banana', 'Cherry']

// Base UI waits for scroll-area animations before measuring. jsdom does not
// implement the Web Animations API, so this file exposes the no-animation case.
Element.prototype.getAnimations ??= () => []

function Fixture() {
  return (
    <Autocomplete items={fruits} open>
      <AutocompleteInput
        aria-label="Search fruit"
        clearProps={{ 'aria-label': 'Clear fruit search' }}
        placeholder="Search fruit…"
        showClear
      />
      <AutocompletePopup>
        <AutocompleteEmpty>No results.</AutocompleteEmpty>
        <AutocompleteList>
          {(fruit: string) => <AutocompleteItem key={fruit}>{fruit}</AutocompleteItem>}
        </AutocompleteList>
      </AutocompletePopup>
      <AutocompleteStatus>Fruit suggestions updated.</AutocompleteStatus>
    </Autocomplete>
  )
}

describe('Autocomplete', () => {
  it('renders the input group + input with their slots', () => {
    const { container } = render(<Fixture />)
    const group = container.querySelector('[data-slot="autocomplete-input-group"]')
    expect(group).not.toBeNull()
    expect(group).toHaveClass('a63-Autocomplete-input-group')
    const input = container.querySelector('[data-slot="autocomplete-input"]')
    expect(input).toHaveAttribute('placeholder', 'Search fruit…')
    // AutocompleteClear (Base UI Clear) only renders when there's a value to clear.
  })

  it('renders the open popup and its items', () => {
    const { getByText } = render(<Fixture />)
    const popup = document.querySelector('[data-slot="autocomplete-popup"]')
    expect(popup).not.toBeNull()
    expect(popup).toHaveClass('a63-Autocomplete-popup')
    expect(popup?.parentElement).toHaveClass('a63-Menu-popup')
    expect(getByText('Apple')).toHaveClass('a63-Menu-item', 'a63-Autocomplete-item')
    expect(getByText('Banana')).toBeInTheDocument()
  })

  it('filters suggestions, exposes the empty state, and keeps combobox semantics', async () => {
    const user = userEvent.setup()
    render(<Fixture />)

    const input = screen.getByRole('combobox', { name: 'Search fruit' })
    expect(input).toHaveAttribute('aria-controls')
    expect(input).toHaveAttribute('aria-expanded', 'true')

    await user.type(input, 'ban')
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'durian')
    expect(screen.getByText('No results.')).toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('clears a query and exposes a polite status region', async () => {
    const user = userEvent.setup()
    render(<Fixture />)

    const input = screen.getByRole('combobox', { name: 'Search fruit' })
    await user.type(input, 'app')
    await user.click(screen.getByRole('button', { name: 'Clear fruit search' }))

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(document.querySelector('[data-slot="autocomplete-status"]')).toHaveTextContent(
      'Fruit suggestions updated.'
    )
  })

  it('marks an invalid input for assistive tech and the recipe', () => {
    render(
      <Autocomplete items={fruits}>
        <AutocompleteInput aria-label="Invalid fruit" invalid />
        <AutocompleteInput aria-label="Valid fruit" />
      </Autocomplete>
    )
    const invalid = screen.getByRole('combobox', { name: 'Invalid fruit' })
    expect(invalid).toHaveAttribute('aria-invalid', 'true')
    expect(invalid).toHaveAttribute('data-invalid')
    expect(invalid.closest('[data-slot="autocomplete-input-group"]')).toHaveAttribute(
      'data-invalid'
    )
    const valid = screen.getByRole('combobox', { name: 'Valid fruit' })
    expect(valid).not.toHaveAttribute('aria-invalid')
    expect(valid).not.toHaveAttribute('data-invalid')
  })

  it('keeps the separator between groups out of the listbox semantics', () => {
    render(
      <Autocomplete items={fruits} open>
        <AutocompleteInput aria-label="Search fruit" />
        <AutocompletePopup>
          <AutocompleteList>
            <AutocompleteGroup>
              <AutocompleteItem value="Apple">Apple</AutocompleteItem>
            </AutocompleteGroup>
            <AutocompleteGroup>
              <AutocompleteSeparator />
              <AutocompleteItem value="Banana">Banana</AutocompleteItem>
            </AutocompleteGroup>
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    )
    const separator = screen
      .getByRole('listbox')
      .querySelector('[data-slot="autocomplete-separator"]')
    expect(separator).not.toBeNull()
    // A listbox may own only options and groups (axe aria-required-children).
    expect(separator).not.toHaveAttribute('role', 'separator')
    expect(separator).toHaveAttribute('role', 'none')
    expect(separator).not.toHaveAttribute('aria-orientation')
  })
})
