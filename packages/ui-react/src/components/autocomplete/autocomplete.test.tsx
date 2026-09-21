import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from './autocomplete'

const fruits = ['Apple', 'Banana', 'Cherry']

function Fixture() {
  return (
    <Autocomplete items={fruits} open>
      <AutocompleteInput placeholder="Search fruit…" showClear />
      <AutocompletePopup>
        <AutocompleteEmpty>No results.</AutocompleteEmpty>
        <AutocompleteList>
          {(fruit: string) => <AutocompleteItem key={fruit}>{fruit}</AutocompleteItem>}
        </AutocompleteList>
      </AutocompletePopup>
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
})
