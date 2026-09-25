import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { declarations } from '../test/css'
import { InformFlyoutStack } from './flyout-stack'

function renderStack(count = 3, props: Record<string, unknown> = {}): HTMLElement {
  render(
    <InformFlyoutStack {...props}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          card {index}
          <button type="button">action {index}</button>
        </div>
      ))}
    </InformFlyoutStack>
  )
  return screen.getByTestId('inform-flyout-stack')
}

function items(stack: HTMLElement): HTMLElement[] {
  return [...stack.querySelectorAll<HTMLElement>('[data-slot="inform-flyout-item"]')]
}

describe('InformFlyoutStack', () => {
  it('applies the supplied inset on its anchored edge', () => {
    expect(renderStack(1, { offset: '6rem' }).style.bottom).toBe('6rem')
  })

  it.each([
    ['bottom-right', 'bottom'],
    ['bottom-left', 'bottom'],
    ['top-right', 'top'],
    ['top-left', 'top'],
  ] as const)('anchors to %s', (placement, edge) => {
    const stack = renderStack(1, { offset: '2rem', placement })

    expect(stack).toHaveAttribute('data-placement', placement)
    expect(stack.style.getPropertyValue(edge)).toBe('2rem')
  })

  it('defaults to the bottom-right corner', () => {
    expect(renderStack(1)).toHaveAttribute('data-placement', 'bottom-right')
  })

  /*
   * Children stay in priority order in the DOM — the order a screen reader
   * announces them — while the front card paints over the ones behind it.
   * Sorting the DOM to get that paint order would trade the reading order away.
   */
  it('keeps DOM order and paints the front card on top', () => {
    const stack = renderStack(3)
    const layers = items(stack).map(item => Number(item.style.zIndex))

    expect(stack.textContent).toContain('card 0')
    expect(layers[0]).toBeGreaterThan(layers[1] ?? 0)
    expect(layers[1]).toBeGreaterThan(layers[2] ?? 0)
  })

  /*
   * Collapsed, cards behind the front one are scaled down so they read as a
   * stack rather than a list — the visual the pattern borrows from toasts.
   */
  it('scales the cards behind the front one down when collapsed', () => {
    const [front, second, third] = items(renderStack(3))

    expect(front?.style.transform).toContain('scale(1)')
    expect(second?.style.transform).toContain('scale(0.95)')
    expect(third?.style.transform).toContain('scale(0.9)')
  })

  it('offsets each card behind the front one so it peeks out', () => {
    const [front, second] = items(renderStack(3))

    expect(front?.style.transform).toContain('translateY(0px)')
    expect(second?.style.transform).toContain('translateY(-14px)')
  })

  it('expands on hover and collapses again on leave', () => {
    const stack = renderStack(3)

    fireEvent.mouseEnter(stack)
    expect(stack).toHaveAttribute('data-expanded')
    expect(items(stack)[1]?.style.transform).toContain('scale(1)')

    fireEvent.mouseLeave(stack)
    expect(stack).not.toHaveAttribute('data-expanded')
  })

  /*
   * Hover alone would strand a keyboard: the cards behind the front one hold
   * their own actions, so focus has to expand the stack too.
   */
  it('expands when focus moves inside it', () => {
    const stack = renderStack(3)

    screen.getByRole('button', { name: 'action 2' }).focus()
    fireEvent.focus(stack)

    expect(stack).toHaveAttribute('data-expanded')
  })

  /*
   * Regression: cards are keyed by message id, so dismissing one swaps every
   * card node below it while these wrappers stay put. Measuring or observing
   * the card instead left the observer on a detached node and the heights
   * stale — two dismissals in a row produced a 26px gap where 8px belonged.
   */
  it('keeps one persistent wrapper per slot for measuring', () => {
    const stack = renderStack(3)
    const before = items(stack)

    // Swapping the children must not replace the wrappers.
    fireEvent.mouseEnter(stack)
    const after = items(stack)

    expect(after).toHaveLength(3)
    expect(after[0]).toBe(before[0])
    expect(after[1]).toBe(before[1])
  })

  it('does not swallow pointer events outside its cards', () => {
    const stack = renderStack(2)

    expect(stack).toHaveClass('a63-InformFlyoutStack')
    for (const item of items(stack)) expect(item).toHaveClass('a63-InformFlyoutStack-item')
    expect(declarations('.a63-InformFlyoutStack')['pointer-events']).toBe('none')
    expect(declarations('.a63-InformFlyoutStack-item')['pointer-events']).toBe('auto')
  })

  it('renders a single card with no offset or scaling', () => {
    const [only] = items(renderStack(1))

    expect(only?.style.transform).toContain('translateY(0px)')
    expect(only?.style.transform).toContain('scale(1)')
  })
})
