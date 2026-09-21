import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScrollableList } from './scrollable-list'

describe('ScrollableList', () => {
  it('renders the list + content slots and its children', () => {
    const { container } = render(
      <ScrollableList>
        <button type="button">One</button>
        <button type="button">Two</button>
      </ScrollableList>
    )
    expect(container.querySelector('[data-slot="scrollable-list"]')).not.toBeNull()
    expect(container).toHaveTextContent('One')
    expect(container).toHaveTextContent('Two')
  })

  it('exposes disabled and draggable state without enabling the disabled drag cursor', () => {
    const { container } = render(
      <ScrollableList disabled draggable>
        <span>One</span>
      </ScrollableList>
    )

    expect(container.querySelector('[data-slot="scrollable-list"]')).toHaveAttribute(
      'data-disabled'
    )
    expect(container.querySelector('[data-slot="scrollable-list"]')).toHaveAttribute(
      'data-draggable'
    )
  })
})
