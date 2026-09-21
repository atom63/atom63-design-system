import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PreviewCard, PreviewCardPopup, PreviewCardTrigger } from './preview-card'

describe('PreviewCard', () => {
  it('renders the trigger, and the popup content when open', () => {
    render(
      <PreviewCard open>
        <PreviewCardTrigger>@atom63</PreviewCardTrigger>
        <PreviewCardPopup>Preview content</PreviewCardPopup>
      </PreviewCard>
    )
    const trigger = screen.getByText('@atom63')
    expect(trigger).toHaveClass('a63-PreviewCard-trigger')
    expect(trigger).toHaveAttribute('data-slot', 'preview-card-trigger')
    const content = document.querySelector('[data-slot="preview-card-content"]')
    expect(content).not.toBeNull()
    expect(content).toHaveClass('a63-PreviewCard-popup')
    expect(document.querySelector('[data-slot="preview-card-portal"]')).not.toBeNull()
  })
})
