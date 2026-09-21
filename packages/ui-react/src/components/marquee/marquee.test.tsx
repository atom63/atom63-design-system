import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
