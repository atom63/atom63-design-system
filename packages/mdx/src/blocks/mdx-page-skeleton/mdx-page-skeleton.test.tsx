import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { MdxPageSkeleton } from './mdx-page-skeleton'

describe('MdxPageSkeleton', () => {
  it('announces loading politely with an accessible name', () => {
    render(<MdxPageSkeleton />)

    const status = screen.getByRole('status', { name: 'Loading page content' })
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('hides the decorative rail from assistive technology, and drops it on request', () => {
    const { container, rerender } = render(<MdxPageSkeleton />)
    expect(container.querySelector('aside')).toHaveAttribute('aria-hidden', 'true')

    rerender(<MdxPageSkeleton showRail={false} />)
    expect(container.querySelector('aside')).toBeNull()
  })

  it('draws one more header chip for a lesson than for a docs page', () => {
    const { container, rerender } = render(<MdxPageSkeleton variant="docs" />)
    const chips = () => container.querySelectorAll('header .flex > *').length
    const docsChips = chips()

    rerender(<MdxPageSkeleton variant="lesson" />)
    expect(chips()).toBe(docsChips + 1)
  })

  it('has no axe violations', async () => {
    const { container } = render(<MdxPageSkeleton variant="lesson" />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
