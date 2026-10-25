import { ratingContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Rating } from './rating'

describe('Rating', () => {
  it('is one image named by its score when read-only, with the default size', () => {
    const { container } = render(<Rating value={4.5} />)
    const image = screen.getByRole('img', { name: '4.5 out of 5' })
    expect(image).toHaveAttribute('data-size', ratingContract.defaultSize)
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
    const items = container.querySelectorAll<HTMLElement>('[data-slot="rating-item"]')
    expect(items).toHaveLength(5)
    expect(items[3]?.style.getPropertyValue('--rating-fill')).toBe('100%')
    expect(items[4]?.style.getPropertyValue('--rating-fill')).toBe('50%')
  })

  it('takes another scale and label', () => {
    render(<Rating label="Seven of ten" max={10} size="sm" value={7} />)
    const image = screen.getByRole('img', { name: 'Seven of ten' })
    expect(image).toHaveAttribute('data-size', 'sm')
    expect(image.querySelectorAll('[data-slot="rating-item"]')).toHaveLength(10)
  })

  it('becomes a radio group with onValueChange, one named radio per star', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating label="Rate it" onValueChange={onValueChange} value={2} />)
    expect(screen.getByRole('radiogroup', { name: 'Rate it' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '2 stars' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: '4 stars' }))
    expect(onValueChange).toHaveBeenCalledWith(4)
    expect(screen.getByRole('radio', { name: '1 star' })).toBeInTheDocument()
  })
})
