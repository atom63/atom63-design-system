import { segmentedControlContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SegmentedControl, type SegmentedControlItem } from './segmented-control'

const ITEMS: SegmentedControlItem[] = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'tree', label: 'Tree' },
]

describe('SegmentedControl', () => {
  it('renders one tab per item with the contract defaults', () => {
    const { container } = render(
      <SegmentedControl items={ITEMS} onValueChange={() => {}} value="list" />
    )
    const root = container.querySelector('[data-slot="segmented-control"]')
    expect(root).toHaveAttribute('data-size', segmentedControlContract.defaultSize)
    expect(segmentedControlContract.defaultVariant).toBe('label')
    expect(root).toHaveAttribute('data-tone', segmentedControlContract.defaultTone)
    expect(root).toHaveAttribute('data-variant', 'label')
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('marks the tab matching value as active', () => {
    render(<SegmentedControl items={ITEMS} onValueChange={() => {}} value="grid" />)
    expect(screen.getByRole('tab', { name: 'Grid' })).toHaveAttribute('data-active')
  })

  it('fires onValueChange when another segment is clicked', async () => {
    const onValueChange = vi.fn()
    render(<SegmentedControl items={ITEMS} onValueChange={onValueChange} value="list" />)
    await userEvent.click(screen.getByRole('tab', { name: 'Tree' }))
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
    const disabled = screen.getByRole('tab', { name: 'Grid' })
    expect(disabled).toHaveAttribute('data-disabled')
    await userEvent.click(disabled)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
