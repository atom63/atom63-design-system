import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const reducedMotion = vi.hoisted(() => vi.fn(() => false))
vi.mock('motion/react', () => ({ useReducedMotion: reducedMotion }))

import { Marquee } from './marquee'

describe('Marquee', () => {
  it('renders the container slot + class with default 4 tracks', () => {
    const { container } = render(
      <Marquee>
        <span>item</span>
      </Marquee>
    )
    const root = container.querySelector('.a63-Marquee')
    expect(root).not.toBeNull()
    expect(root).toHaveAttribute('data-slot', 'marquee')
    expect(root).toHaveAttribute('data-orientation', 'horizontal')
    expect(container.querySelectorAll('[data-slot="marquee-track"]')).toHaveLength(4)
    expect(
      container.querySelectorAll('[data-slot="marquee-track"][aria-hidden="true"]')
    ).toHaveLength(3)
    expect(container.querySelectorAll('[data-slot="marquee-track"][inert]')).toHaveLength(3)
  })

  it('honors the repeat count', () => {
    const { container } = render(
      <Marquee repeat={2}>
        <span>x</span>
      </Marquee>
    )
    expect(container.querySelectorAll('.a63-Marquee-track')).toHaveLength(2)
  })

  it('reflects vertical / reverse / paused / pauseOnHover state', () => {
    const { container } = render(
      <Marquee vertical reverse paused pauseOnHover repeat={1}>
        <span>x</span>
      </Marquee>
    )
    expect(container.querySelector('.a63-Marquee')).toHaveAttribute('data-orientation', 'vertical')
    const track = container.querySelector('.a63-Marquee-track')
    expect(track).toHaveAttribute('data-orientation', 'vertical')
    expect(track).toHaveAttribute('data-reverse')
    expect(track).toHaveAttribute('data-paused')
    expect(track).toHaveAttribute('data-pause-on-hover')
  })

  it('feeds the gap into the --gap custom property', () => {
    const { container } = render(
      <Marquee gap="2rem" repeat={1}>
        <span>x</span>
      </Marquee>
    )
    expect(container.querySelector('.a63-Marquee')).toHaveStyle({ '--gap': '2rem' })
  })

  it('preserves the gap custom property when caller styles are provided', () => {
    const { container } = render(
      <Marquee gap="2rem" repeat={1} style={{ color: 'red' }}>
        <span>x</span>
      </Marquee>
    )
    const root = container.querySelector<HTMLElement>('.a63-Marquee')
    expect(root).toHaveStyle({ '--gap': '2rem' })
    expect(root?.style.color).toBe('red')
  })
})

describe('Marquee pause (WCAG 2.2.2)', () => {
  it('pauses on hover and focus by default', () => {
    const { container } = render(
      <Marquee repeat={1}>
        <span>x</span>
      </Marquee>
    )
    expect(container.querySelector('.a63-Marquee-track')).toHaveAttribute('data-pause-on-hover')
  })

  it('renders a pause toggle that stops and restarts every track', () => {
    const { container } = render(
      <Marquee repeat={2}>
        <span>x</span>
      </Marquee>
    )
    const toggle = screen.getByRole('button', { name: 'Pause' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle).toHaveClass('a63-Marquee-control')
    expect(container.querySelectorAll('.a63-Marquee-track[data-paused]')).toHaveLength(0)

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelectorAll('.a63-Marquee-track[data-paused]')).toHaveLength(2)

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(container.querySelectorAll('.a63-Marquee-track[data-paused]')).toHaveLength(0)
  })

  it('takes a translated label for the toggle', () => {
    render(
      <Marquee pauseLabel="暂停">
        <span>x</span>
      </Marquee>
    )
    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()
  })

  it('hands pausing to the caller when paused is passed', () => {
    const { container, rerender } = render(
      <Marquee paused={false} repeat={1}>
        <span>x</span>
      </Marquee>
    )
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('.a63-Marquee-track')).not.toHaveAttribute('data-paused')
    rerender(
      <Marquee paused repeat={1}>
        <span>x</span>
      </Marquee>
    )
    expect(container.querySelector('.a63-Marquee-track')).toHaveAttribute('data-paused')
  })
})

describe('Marquee under reduced motion', () => {
  afterEach(() => {
    reducedMotion.mockReturnValue(false)
  })

  it('becomes a focusable, named scroll region so keyboard users can scroll it', () => {
    reducedMotion.mockReturnValue(true)
    const { container } = render(
      <Marquee>
        <span>item</span>
      </Marquee>
    )
    const root = container.querySelector('.a63-Marquee')
    expect(root).toHaveAttribute('tabindex', '0')
    expect(root).toHaveAttribute('role', 'group')
    expect(root).toHaveAttribute('aria-label', 'Scrolling content')
  })

  it('shows no pause toggle, since nothing moves', () => {
    reducedMotion.mockReturnValue(true)
    render(
      <Marquee>
        <span>item</span>
      </Marquee>
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('adds no tab stop while the strip animates', () => {
    const { container } = render(
      <Marquee>
        <span>item</span>
      </Marquee>
    )
    const root = container.querySelector('.a63-Marquee')
    expect(root).not.toHaveAttribute('tabindex')
    expect(root).not.toHaveAttribute('role')
  })
})
