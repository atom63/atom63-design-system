import { segmentedControlContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SegmentedControl, type SegmentedControlItem } from './segmented-control'

const ITEMS: SegmentedControlItem[] = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'tree', label: 'Tree' },
]

describe('SegmentedControl', () => {
  it('renders one radio per item with the contract defaults', () => {
    const { container } = render(
      <SegmentedControl items={ITEMS} onValueChange={() => {}} value="list" />
    )
    const root = container.querySelector('[data-slot="segmented-control"]')
    expect(root).toHaveAttribute('data-size', segmentedControlContract.defaultSize)
    expect(segmentedControlContract.defaultVariant).toBe('label')
    expect(root).toHaveAttribute('data-tone', segmentedControlContract.defaultTone)
    expect(root).toHaveAttribute('data-variant', 'label')
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('checks the radio matching value', () => {
    render(<SegmentedControl items={ITEMS} onValueChange={() => {}} value="grid" />)
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked()
  })

  it('fires onValueChange when another segment is clicked', async () => {
    const onValueChange = vi.fn()
    render(<SegmentedControl items={ITEMS} onValueChange={onValueChange} value="list" />)
    await userEvent.click(screen.getByRole('radio', { name: 'Tree' }))
    expect(onValueChange).toHaveBeenCalledWith('tree')
  })

  it('applies icon variant and accent tone', () => {
    const { container } = render(
      <SegmentedControl
        items={ITEMS}
        onValueChange={() => {}}
        tone="accent"
        value="list"
        variant="icon"
      />
    )
    const root = container.querySelector('[data-slot="segmented-control"]')
    expect(root).toHaveAttribute('data-variant', 'icon')
    expect(root).toHaveAttribute('data-tone', 'accent')
  })

  it('renders the icon slot in icon variant and the label slot in label variant', () => {
    const iconTree = render(
      <SegmentedControl items={ITEMS} onValueChange={() => {}} value="list" variant="icon" />
    )
    expect(iconTree.container.querySelector('[data-slot="segmented-control-icon"]')).not.toBeNull()
    expect(iconTree.container.querySelector('[data-slot="segmented-control-label"]')).toBeNull()

    const labelTree = render(
      <SegmentedControl items={ITEMS} onValueChange={() => {}} value="list" variant="label" />
    )
    expect(
      labelTree.container.querySelector('[data-slot="segmented-control-label"]')
    ).not.toBeNull()
  })

  it('marks a disabled item and does not fire onValueChange for it', async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        items={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid', disabled: true },
        ]}
        onValueChange={onValueChange}
        value="list"
      />
    )
    const disabled = screen.getByRole('radio', { name: 'Grid' })
    expect(disabled).toHaveAttribute('data-disabled')
    await userEvent.click(disabled)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('switches segments uncontrolled from defaultValue', async () => {
    const onValueChange = vi.fn()
    render(<SegmentedControl defaultValue="grid" items={ITEMS} onValueChange={onValueChange} />)
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked()
    await userEvent.click(screen.getByRole('radio', { name: 'Tree' }))
    expect(screen.getByRole('radio', { name: 'Tree' })).toBeChecked()
    expect(onValueChange).toHaveBeenCalledWith('tree')
  })

  it('is a radio group named by aria-label, with no tab roles', () => {
    render(
      <SegmentedControl aria-label="View" items={ITEMS} onValueChange={() => {}} value="list" />
    )
    const group = screen.getByRole('radiogroup', { name: 'View' })
    expect(group).toHaveAttribute('data-slot', 'segmented-control')
    expect(screen.queryAllByRole('tab')).toHaveLength(0)
    expect(screen.queryByRole('tablist')).toBeNull()
    for (const radio of screen.getAllByRole('radio')) expect(group).toContainElement(radio)
  })

  it('is named by aria-labelledby', () => {
    render(
      <>
        <span id="view-label">Layout</span>
        <SegmentedControl aria-labelledby="view-label" items={ITEMS} value="list" />
      </>
    )
    expect(screen.getByRole('radiogroup', { name: 'Layout' })).toBeInTheDocument()
  })

  it('enters at the selected segment and moves the selection with the arrow keys', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SegmentedControl defaultValue="grid" items={ITEMS} onValueChange={onValueChange} />)
    await user.tab()
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Tree' })).toHaveFocus()
    expect(screen.getByRole('radio', { name: 'Tree' })).toBeChecked()
    expect(onValueChange).toHaveBeenLastCalledWith('tree')
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Tree' })).toBeChecked()
  })

  it('spreads props onto the root and forwards its ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <SegmentedControl
        aria-label="View"
        data-testid="view"
        id="view"
        items={ITEMS}
        ref={ref}
        value="list"
      />
    )
    const root = container.querySelector('[data-slot="segmented-control"]')
    expect(root).toHaveAttribute('id', 'view')
    expect(root).toHaveAttribute('data-testid', 'view')
    expect(root).toHaveAttribute('aria-label', 'View')
    expect(ref.current).toBe(root)
  })
})
