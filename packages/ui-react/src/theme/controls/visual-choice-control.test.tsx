import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { VisualChoiceControl, type VisualChoiceOption } from './visual-choice-control'

const OPTIONS: readonly VisualChoiceOption<'a' | 'b' | 'c'>[] = [
  {
    id: 'a',
    name: 'Alpha',
    renderVisual: selected => <span aria-hidden="true">a-visual{selected ? '-on' : ''}</span>,
  },
  { id: 'b', name: 'Bravo', renderVisual: () => <span aria-hidden="true">b-visual</span> },
  { id: 'c', name: 'Charlie', renderVisual: () => <span aria-hidden="true">c-visual</span> },
]

describe('VisualChoiceControl', () => {
  it('names the group via an sr-only legend and marks the selected card pressed', () => {
    render(
      <VisualChoiceControl label="Test axis" onChange={() => {}} options={OPTIONS} value="b" />
    )
    expect(screen.getByRole('group', { name: 'Test axis' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(OPTIONS.length)
    expect(screen.getByRole('button', { name: 'Bravo', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alpha', pressed: false })).toBeInTheDocument()
  })

  it('calls onChange with the option id when a card is clicked', () => {
    const onChange = vi.fn()
    render(
      <VisualChoiceControl label="Test axis" onChange={onChange} options={OPTIONS} value="a" />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Charlie' }))
    expect(onChange).toHaveBeenCalledWith('c')
  })
})
