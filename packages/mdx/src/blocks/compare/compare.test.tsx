import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Compare } from './compare'

describe('Compare', () => {
  it('renders title/description props (back-compat)', () => {
    render(
      <Compare description="Two ways to do it" title="Old vs New">
        <Compare.Item title="A">left</Compare.Item>
        <Compare.Item title="B">right</Compare.Item>
      </Compare>
    )
    expect(screen.getByText('Old vs New')).toBeInTheDocument()
    expect(screen.getByText('Two ways to do it')).toBeInTheDocument()
    expect(screen.getByText('left')).toBeInTheDocument()
    expect(screen.getByText('right')).toBeInTheDocument()
  })

  it('renders Title/Description slots when provided', () => {
    render(
      <Compare>
        <Compare.Title>Slotted title</Compare.Title>
        <Compare.Description>Slotted description</Compare.Description>
        <Compare.Item title="A">left</Compare.Item>
        <Compare.Item title="B">right</Compare.Item>
      </Compare>
    )
    const title = screen.getByText('Slotted title')
    expect(title.closest('[data-slot="title"]')).not.toBeNull()
    const description = screen.getByText('Slotted description')
    expect(description.closest('[data-slot="description"]')).not.toBeNull()
    expect(screen.getByText('left')).toBeInTheDocument()
  })

  it('prefers the slot over the prop when both are supplied', () => {
    render(
      <Compare title="Prop title">
        <Compare.Title>Slot title</Compare.Title>
        <Compare.Item title="A">left</Compare.Item>
      </Compare>
    )
    expect(screen.getByText('Slot title')).toBeInTheDocument()
    expect(screen.queryByText('Prop title')).toBeNull()
  })

  it('renders Compare.Item content as before', () => {
    render(
      <Compare>
        <Compare.Item eyebrow="before" title="A" tone="negative">
          left
        </Compare.Item>
      </Compare>
    )
    expect(screen.getByText('before')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('left')).toBeInTheDocument()
  })
})
