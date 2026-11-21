import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { PageMeta } from './page-meta'

describe('PageMeta', () => {
  it('renders the title as the page heading, with description and meta row', () => {
    const { container } = render(
      <PageMeta description="How tokens flow" eyebrow="Guide" meta="5 min read" title="Tokens" />
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Tokens' })).toBeInTheDocument()
    expect(screen.getByText('How tokens flow')).toBeInTheDocument()
    expect(screen.getByText('Guide')).toBeInTheDocument()
    expect(screen.getByText('5 min read')).toBeInTheDocument()
    // The separator only appears between eyebrow and meta, and is decorative.
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('·')
  })

  it('omits the meta row and separator when neither eyebrow nor meta is given', () => {
    const { container } = render(<PageMeta title="Tokens" />)

    expect(container.querySelector('.mdx-page-meta-eyebrow')).toBeNull()
  })

  it('omits the separator when only one of eyebrow and meta is given', () => {
    const { container } = render(<PageMeta eyebrow="Guide" title="Tokens" />)

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <PageMeta description="How tokens flow" eyebrow="Guide" meta="5 min read" title="Tokens" />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
