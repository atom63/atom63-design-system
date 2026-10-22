import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

  describe('chevrons', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    // jsdom has no layout: give the viewport a 300px window onto 1000px of content.
    function renderOverflowing(direction: 'ltr' | 'rtl', scrollLeft: number) {
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(1000)
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
      vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(scrollLeft)
      const computed = window.getComputedStyle
      vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
        const style = computed(element)
        return new Proxy(style, {
          get: (target, key) => (key === 'direction' ? direction : Reflect.get(target, key)),
        })
      })
      return render(
        <ScrollableList>
          <span>One</span>
        </ScrollableList>
      )
    }

    function sides(container: HTMLElement) {
      return Array.from(
        container.querySelectorAll('[data-slot="scrollable-list-control"]'),
        control => [control.getAttribute('data-side'), control.querySelector('button')?.ariaLabel]
      )
    }

    it('shows only the end control at the start of an LTR list', () => {
      const { container } = renderOverflowing('ltr', 0)
      expect(sides(container)).toEqual([['end', 'Scroll right']])
    })

    it('shows only the end control, pointing left, at the start of an RTL list', () => {
      const { container } = renderOverflowing('rtl', 0)
      expect(sides(container)).toEqual([['end', 'Scroll left']])
    })

    it('shows the start control once an RTL list has scrolled (negative scrollLeft)', () => {
      const { container } = renderOverflowing('rtl', -200)
      expect(sides(container)).toEqual([
        ['start', 'Scroll right'],
        ['end', 'Scroll left'],
      ])
    })

    it('scrolls an RTL list towards its end with a negative offset', () => {
      const original = HTMLElement.prototype.scrollTo
      const scrollTo = vi.fn()
      HTMLElement.prototype.scrollTo = scrollTo
      try {
        const { getByRole } = renderOverflowing('rtl', 0)
        getByRole('button', { name: 'Scroll left' }).click()
        expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: -240 }))
      } finally {
        HTMLElement.prototype.scrollTo = original
      }
    })
  })
})
