import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ScrollableList, type ScrollableListProps } from './scrollable-list'

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

  it('scrolls only along the row: the viewport hides vertical overflow', () => {
    const { container } = render(
      <ScrollableList>
        <button type="button">One</button>
      </ScrollableList>
    )
    const viewport = container.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    expect(viewport?.style.overflowY).toBe('hidden')
  })

  it('fades only the inline edges, and none when mask is off', () => {
    const { container, rerender } = render(
      <ScrollableList>
        <button type="button">One</button>
      </ScrollableList>
    )
    const viewport = () => container.querySelector('[data-slot="scroll-area-viewport"]')
    expect(viewport()).toHaveAttribute('data-scroll-fade', 'horizontal')

    rerender(
      <ScrollableList mask={false}>
        <button type="button">One</button>
      </ScrollableList>
    )
    expect(viewport()).not.toHaveAttribute('data-scroll-fade')
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
    function renderOverflowing(
      direction: 'ltr' | 'rtl',
      scrollLeft: number,
      props: Partial<ScrollableListProps> = {}
    ) {
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(1000)
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
      vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(scrollLeft)
      const computed = window.getComputedStyle
      vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
        const style = computed(element)
        return new Proxy(style, {
          get: (target, key) => {
            if (key === 'direction') return direction
            const value = Reflect.get(target, key)
            // jsdom checks that its methods are called on the real declaration.
            return typeof value === 'function' ? value.bind(target) : value
          },
        })
      })
      return render(
        <ScrollableList {...props}>
          <span>One</span>
        </ScrollableList>
      )
    }

    function sides(container: HTMLElement) {
      return Array.from(
        container.querySelectorAll('[data-slot="scrollable-list-control"][data-visible]'),
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

    it('moves focus to the other control when the focused one reaches its edge', () => {
      const { container, getByRole } = renderOverflowing('ltr', 0)
      const end = getByRole('button', { name: 'Scroll right' })
      end.focus()
      vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(700)
      act(() => {
        container
          .querySelector('[data-slot="scroll-area-viewport"]')
          ?.dispatchEvent(new Event('scroll'))
      })
      expect(sides(container)).toEqual([['start', 'Scroll left']])
      expect(getByRole('button', { name: 'Scroll left' })).toHaveFocus()
      expect(end.closest('[data-slot="scrollable-list-control"]')).toHaveAttribute('inert')
    })

    it('takes overridable control labels', () => {
      const { container } = renderOverflowing('ltr', 200, {
        scrollEndLabel: 'Weiter',
        scrollStartLabel: 'Zurück',
      })
      expect(sides(container)).toEqual([
        ['start', 'Zurück'],
        ['end', 'Weiter'],
      ])
    })
  })

  it('names the list and forwards props to its root', () => {
    render(
      <ScrollableList aria-label="Categories" data-testid="list">
        <span>One</span>
      </ScrollableList>
    )
    const list = screen.getByRole('group', { name: 'Categories' })
    expect(list).toHaveAttribute('data-slot', 'scrollable-list')
    expect(list).toHaveAttribute('data-testid', 'list')
  })
})
