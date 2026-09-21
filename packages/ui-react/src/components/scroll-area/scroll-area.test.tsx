import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScrollArea } from './scroll-area'

describe('ScrollArea', () => {
  it('renders the root + viewport slots and its children', () => {
    const { container } = render(
      <ScrollArea style={{ height: 100 }}>
        <div style={{ height: 400 }}>tall content</div>
      </ScrollArea>
    )
    expect(container.querySelector('[data-slot="scroll-area"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).not.toBeNull()
    expect(container).toHaveTextContent('tall content')
  })

  it('surfaces scrollFade as a data attribute', () => {
    const { container } = render(
      <ScrollArea scrollFade>
        <div>content</div>
      </ScrollArea>
    )
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toHaveAttribute(
      'data-scroll-fade'
    )
  })

  it('observes dynamically-sized content for overflow updates', () => {
    const { container } = render(
      <ScrollArea>
        <div>streamed content</div>
      </ScrollArea>
    )

    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]')
    const content = container.querySelector('[data-slot="scroll-area-content"]')

    expect(content).not.toBeNull()
    expect(content?.parentElement).toBe(viewport)
  })

  it('surfaces scrollbar layout options', () => {
    const { container } = render(
      <ScrollArea scrollbarGutter showScrollbarOnHover>
        <div>content</div>
      </ScrollArea>
    )

    expect(container.querySelector('[data-slot="scroll-area"]')).toHaveAttribute(
      'data-show-on-hover'
    )
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toHaveAttribute(
      'data-scrollbar-gutter'
    )
  })

  it('forwards viewport attributes to the scrollable element', () => {
    const { container } = render(
      <ScrollArea viewportProps={{ 'aria-label': 'Document', 'data-scroll-root': '' }}>
        <div>content</div>
      </ScrollArea>
    )

    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toHaveAttribute(
      'aria-label',
      'Document'
    )
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toHaveAttribute(
      'data-scroll-root'
    )
  })
})
