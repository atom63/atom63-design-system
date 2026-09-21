import { act, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardMedia,
  CardMediaOverlay,
  CardMediaOverlayIconButton,
  CardMediaOverlayScrim,
  CardTitle,
} from './card'
import { useCardCursor } from './use-card-cursor'

describe('Card', () => {
  it('renders a surface with variant + padding defaults', () => {
    const { container } = render(<Card>body</Card>)
    const el = container.querySelector('.a63-Card')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'card')
    expect(el).toHaveAttribute('data-variant', 'default')
    expect(el).toHaveAttribute('data-padding', 'md')
    expect(el).toHaveTextContent('body')
  })

  it('defaults overlay variant to padding=none', () => {
    const { container } = render(<Card variant="overlay">o</Card>)
    const el = container.querySelector('.a63-Card')
    expect(el).toHaveAttribute('data-variant', 'overlay')
    expect(el).toHaveAttribute('data-padding', 'none')
  })

  it('honors an explicit padding over the variant default', () => {
    const { container } = render(
      <Card padding="lg" variant="overlay">
        o
      </Card>
    )
    expect(container.querySelector('.a63-Card')).toHaveAttribute('data-padding', 'lg')
  })

  it('composes media / content / title / footer slots', () => {
    const { container } = render(
      <Card>
        <CardMedia aspectRatio="16/9" />
        <CardContent>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardContent>
        <CardFooter>foot</CardFooter>
      </Card>
    )
    expect(container.querySelector('[data-slot="card-media"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="card-content"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="card-title"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="card-footer"]')).not.toBeNull()
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('resolves responsive { base, sm } content padding to data attributes', () => {
    const { container } = render(<CardContent padding={{ base: 'sm', sm: 'lg' }}>c</CardContent>)
    const el = container.querySelector('[data-slot="card-content"]')
    expect(el).toHaveAttribute('data-padding', 'sm')
    expect(el).toHaveAttribute('data-padding-sm', 'lg')
  })

  it('applies lineClamp as a data attribute', () => {
    const { container } = render(<CardTitle lineClamp={2}>clamped</CardTitle>)
    expect(container.querySelector('[data-slot="card-title"]')).toHaveAttribute(
      'data-line-clamp',
      '2'
    )
  })

  it('renders the media-overlay family (scrim + icon button)', () => {
    const { container } = render(
      <CardMediaOverlay aspectRatio="1/1">
        <CardMediaOverlayScrim />
        <CardMediaOverlayIconButton />
      </CardMediaOverlay>
    )
    expect(container.querySelector('[data-slot="card-media-overlay"]')).toHaveAttribute(
      'data-aspect'
    )
    expect(container.querySelector('[data-slot="card-media-overlay-scrim"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="card-media-overlay-icon-button"]')).not.toBeNull()
  })

  it('defaults CardTitle to 2-line and CardDescription to 3-line clamp', () => {
    const { container } = render(
      <>
        <CardTitle>t</CardTitle>
        <CardDescription>d</CardDescription>
      </>
    )
    expect(container.querySelector('[data-slot="card-title"]')).toHaveAttribute(
      'data-line-clamp',
      '2'
    )
    expect(container.querySelector('[data-slot="card-description"]')).toHaveAttribute(
      'data-line-clamp',
      '3'
    )
  })

  it('CardMedia opts into hover-scale by default, off when disabled', () => {
    const { container } = render(
      <>
        <CardMedia />
        <CardMedia hoverScale={false} />
      </>
    )
    const [a, b] = container.querySelectorAll('[data-slot="card-media"]')
    expect(a).toHaveAttribute('data-hover-scale')
    expect(b).not.toHaveAttribute('data-hover-scale')
  })

  it('honors the render prop for polymorphism', () => {
    const { container } = render(<Card render={<section />}>as section</Card>)
    expect(container.querySelector('section.a63-Card')).not.toBeNull()
  })
})

describe('useCardCursor', () => {
  it('toggles active and reports the pointer position via onMove', () => {
    const moves: { x: number; y: number }[] = []
    const { result } = renderHook(() => useCardCursor({ onMove: p => moves.push(p) }))

    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ left: 10, top: 20, width: 0, height: 0 }) as DOMRect
    result.current.ref.current = el

    expect(result.current.active).toBe(false)
    act(() => {
      result.current.onPointerEnter({ clientX: 40, clientY: 55 } as React.PointerEvent<HTMLElement>)
    })
    expect(result.current.active).toBe(true)
    expect(moves.at(-1)).toEqual({ x: 30, y: 35 })

    act(() => {
      result.current.onPointerLeave()
    })
    expect(result.current.active).toBe(false)
  })
})
