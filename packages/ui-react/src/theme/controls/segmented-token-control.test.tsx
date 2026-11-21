import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { THEME_OPTIONS } from '../core/options'
import { SegmentedTokenControl } from './segmented-token-control'

describe('SegmentedTokenControl', () => {
  it('renders a radio per option (by label) and reflects the value', () => {
    render(<SegmentedTokenControl onChange={() => {}} options={THEME_OPTIONS} value="aqua" />)
    // labels: Modern / Aqua / Retro / Terminal
    expect(screen.getByRole('radio', { name: 'Aqua' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Retro' })).toBeInTheDocument()
  })

  it('calls onChange with the option id when a segment is clicked', () => {
    const onChange = vi.fn()
    render(<SegmentedTokenControl onChange={onChange} options={THEME_OPTIONS} value="modern" />)
    fireEvent.click(screen.getByRole('radio', { name: 'Terminal' }))
    expect(onChange).toHaveBeenCalledWith('terminal')
  })
})
