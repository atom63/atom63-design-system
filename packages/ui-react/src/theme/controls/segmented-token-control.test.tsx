import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { THEME_OPTIONS } from '../core/options'
import { SegmentedTokenControl } from './segmented-token-control'

describe('SegmentedTokenControl', () => {
  it('renders a tab per option (by label) and reflects the value', () => {
    render(<SegmentedTokenControl onChange={() => {}} options={THEME_OPTIONS} value="aqua" />)
    // labels: Modern / Aqua / Retro / Terminal
    // Base UI Tabs marks the active tab via aria-selected (not data-selected).
    expect(screen.getByRole('tab', { name: 'Aqua' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Retro' })).toBeInTheDocument()
  })

  it('calls onChange with the option id when a segment is clicked', () => {
    const onChange = vi.fn()
    render(<SegmentedTokenControl onChange={onChange} options={THEME_OPTIONS} value="modern" />)
    fireEvent.click(screen.getByRole('tab', { name: 'Terminal' }))
    expect(onChange).toHaveBeenCalledWith('terminal')
  })
})
