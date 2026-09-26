import { selectContract } from '@atom63/ui-foundation'
import { render, screen, waitFor } from '@testing-library/react'
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

  describe('APG select-only keyboard', () => {
    const options = ITEMS.map(i => (
      <SelectItem key={i.value} value={i.value}>
        {i.label}
      </SelectItem>
    ))

    function Keyboard({
      defaultValue = 'all',
      multiple = false,
      onOpenChange,
      onValueChange,
    }: {
      defaultValue?: string
      multiple?: boolean
      onOpenChange?: (open: boolean, details: { reason: string }) => void
      onValueChange?: (value: unknown) => void
    }) {
      const trigger = (
        <SelectTrigger aria-label="Type">
          <SelectValue />
        </SelectTrigger>
      )
      return (
        <>
          {multiple ? (
            <Select
              defaultValue={[defaultValue]}
              items={ITEMS}
              multiple
              onOpenChange={onOpenChange}
              onValueChange={onValueChange}
            >
              {trigger}
              <SelectPopup>{options}</SelectPopup>
            </Select>
          ) : (
            <Select
              defaultValue={defaultValue}
              items={ITEMS}
              onOpenChange={onOpenChange}
              onValueChange={onValueChange}
            >
              {trigger}
              <SelectPopup>{options}</SelectPopup>
            </Select>
          )}
          <button type="button">After</button>
        </>
      )
    }

    async function openAndHighlightSecond(user: ReturnType<typeof userEvent.setup>) {
      screen.getByRole('combobox').focus()
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(screen.getByRole('option', { name: 'All' })).toHaveFocus())
      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(screen.getByRole('option', { name: 'Article' })).toHaveFocus())
    }

    it('opens on Home with the first option focused, without selecting', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<Keyboard defaultValue="video" onValueChange={onValueChange} />)
      screen.getByRole('combobox').focus()
      await user.keyboard('{Home}')
      await waitFor(() => expect(screen.getByRole('option', { name: 'All' })).toHaveFocus())
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('opens on End with the last option focused', async () => {
      const user = userEvent.setup()
      render(<Keyboard />)
      screen.getByRole('combobox').focus()
      await user.keyboard('{End}')
      await waitFor(() => expect(screen.getByRole('option', { name: 'Video' })).toHaveFocus())
    })

    it('selects the highlighted option and closes on Alt + Up Arrow', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<Keyboard onValueChange={onValueChange} />)
      await openAndHighlightSecond(user)
      await user.keyboard('{Alt>}{ArrowUp}{/Alt}')
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0]?.[0]).toBe('article')
      await waitFor(() =>
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
      )
      expect(screen.getByRole('combobox')).toHaveFocus()
    })

    it('selects the highlighted option on Tab without an item-press close', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const onOpenChange = vi.fn()
      render(<Keyboard onOpenChange={onOpenChange} onValueChange={onValueChange} />)
      await openAndHighlightSecond(user)
      await user.keyboard('{Tab}')
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0]?.[0]).toBe('article')
      const reasons = onOpenChange.mock.calls.map(([, details]) => details.reason)
      expect(reasons).not.toContain('item-press')
    })

    it('leaves Tab alone in a multiple select', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<Keyboard multiple onValueChange={onValueChange} />)
      await openAndHighlightSecond(user)
      await user.keyboard('{Tab}')
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })
})
