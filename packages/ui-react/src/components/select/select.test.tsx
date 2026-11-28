import { selectContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

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

  it('marks an invalid trigger for assistive tech and the recipe', () => {
    render(
      <Select items={ITEMS} value="all">
        <SelectTrigger aria-label="Type" invalid>
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    const trigger = screen.getByRole('combobox', { name: 'Type' })
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAttribute('data-invalid')
  })

  it('treats aria-invalid as invalid and leaves a valid trigger unmarked', () => {
    render(
      <Select items={ITEMS} value="all">
        <SelectTrigger aria-invalid aria-label="Invalid">
          <SelectValue />
        </SelectTrigger>
        <SelectTrigger aria-label="Valid">
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByRole('combobox', { name: 'Invalid' })).toHaveAttribute('data-invalid')
    const valid = screen.getByRole('combobox', { name: 'Valid' })
    expect(valid).not.toHaveAttribute('data-invalid')
    expect(valid).not.toHaveAttribute('aria-invalid')
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

  it('keeps the separator between groups out of the listbox semantics', async () => {
    render(
      <Select defaultOpen items={ITEMS} value="all">
        <SelectTrigger aria-label="Type">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          <SelectGroup>
            <SelectGroupLabel>First</SelectGroupLabel>
            <SelectItem value="all">All</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Second</SelectGroupLabel>
            <SelectItem value="video">Video</SelectItem>
          </SelectGroup>
        </SelectPopup>
      </Select>
    )
    const listbox = await screen.findByRole('listbox')
    const separator = listbox.querySelector('[data-slot="select-separator"]')
    expect(separator).not.toBeNull()
    // A listbox may own only options and groups (axe aria-required-children).
    expect(separator).not.toHaveAttribute('role', 'separator')
    expect(separator).toHaveAttribute('role', 'none')
    expect(separator).not.toHaveAttribute('aria-orientation')
  })

  it.each([
    ['Home', 'All'],
    ['End', 'Video'],
  ])('opens a closed trigger on %s with focus on the edge option', async (key, label) => {
    render(
      <Select items={ITEMS} value="article">
        <SelectTrigger aria-label="Type">
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
    const trigger = screen.getByRole('combobox', { name: 'Type' })
    trigger.focus()
    await userEvent.keyboard(`{${key}}`)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const option = await screen.findByRole('option', { name: label })
    await vi.waitFor(() => expect(document.activeElement).toBe(option))
  })
})
