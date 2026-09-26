import { selectContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from './select'

const ITEMS = [
  { value: 'all', label: 'All' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
]

describe('Select', () => {
  it('renders the trigger with the default size', () => {
    render(
      <Select items={ITEMS} value="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger')
    expect(trigger).toHaveAttribute('data-size', selectContract.defaultSize)
  })

  it('shows the selected value label', () => {
    render(
      <Select items={ITEMS} value="article">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByText('Article')).toBeInTheDocument()
  })

  it('renders options when open and fires onValueChange on select', async () => {
    const onValueChange = vi.fn()
    render(
      <Select defaultOpen items={ITEMS} onValueChange={onValueChange} value="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {ITEMS.map(i => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    )
    const video = await screen.findByRole('option', { name: 'Video' })
    await userEvent.click(video)
    expect(onValueChange).toHaveBeenCalled()
    expect(onValueChange.mock.calls[0][0]).toBe('video')
  })

  it('marks a disabled trigger', () => {
    render(
      <Select items={ITEMS} value="all">
        <SelectTrigger disabled>
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('keeps popup and list class names on their respective slots', async () => {
    render(
      <Select defaultOpen items={ITEMS} value="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectPopup className="popup-class" listClassName="list-class">
          <SelectItem value="all">All</SelectItem>
        </SelectPopup>
      </Select>
    )

    await screen.findByRole('listbox')
    expect(document.querySelector('[data-slot="select-popup"]')).toHaveClass('popup-class')
    expect(document.querySelector('[data-slot="select-surface"]')).toHaveClass('a63-Menu-popup')
    expect(document.querySelector('[data-slot="select-item"]')).toHaveClass('a63-Menu-item')
    expect(document.querySelector('[data-slot="select-list"]')).toHaveClass('list-class')
  })
})
