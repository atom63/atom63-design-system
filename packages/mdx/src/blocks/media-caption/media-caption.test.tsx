import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { MediaCaption } from './media-caption'

describe('MediaCaption', () => {
  it('captions its figure, keeping inline markup', () => {
    render(
      <figure>
        <img alt="A chart" src="/chart.png" />
        <MediaCaption className="extra">
          Figure 1 · <a href="/source">source</a>
        </MediaCaption>
      </figure>
    )

    const caption = screen.getByText(/Figure 1/).closest('figcaption')
    expect(caption).toHaveClass('extra')
    expect(caption?.parentElement).toBe(screen.getByRole('figure'))
    expect(screen.getByRole('link', { name: 'source' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <figure>
        <img alt="A chart" src="/chart.png" />
        <MediaCaption>Figure 1</MediaCaption>
      </figure>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
