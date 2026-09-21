import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type FormEvent, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SearchField } from './search-field'

function ControlledSearch({ onValueChange }: { onValueChange: (value: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <SearchField
      aria-label="Search projects"
      onValueChange={next => {
        setValue(next)
        onValueChange(next)
      }}
      value={value}
    />
  )
}

describe('SearchField', () => {
  it('uses native search semantics and reports query changes', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ControlledSearch onValueChange={onValueChange} />)

    const input = screen.getByRole('searchbox', { name: 'Search projects' })
    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('spellcheck', 'false')
    await user.type(input, 'mobile')
    expect(onValueChange).toHaveBeenLastCalledWith('mobile')
  })

  it('clears the query and restores input focus', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<SearchField aria-label="Search projects" defaultValue="mobile" onClear={onClear} />)

    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toHaveValue('')
    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toHaveFocus()
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('submits through its containing form on Enter', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <SearchField aria-label="Search projects" />
      </form>
    )

    await user.type(screen.getByRole('searchbox', { name: 'Search projects' }), 'mobile{Enter}')
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('prevents editing and clear actions while disabled', () => {
    render(<SearchField aria-label="Search projects" disabled value="mobile" />)

    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })
})
