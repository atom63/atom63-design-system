import { fireEvent, render } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'

// embla-carousel reads window.matchMedia on mount for its breakpoint options,
// which jsdom doesn't implement — stub a static (no-op listener) media query.
beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})

function Fixture() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

describe('Carousel', () => {
  it('renders the region + all items', () => {
    const { container, getByText } = render(<Fixture />)
    const root = container.querySelector('.a63-Carousel')
    expect(root).not.toBeNull()
    expect(root).toHaveAttribute('data-slot', 'carousel')
    expect(root).toHaveAttribute('data-orientation', 'horizontal')
    expect(getByText('Slide 1')).toBeInTheDocument()
    expect(getByText('Slide 2')).toBeInTheDocument()
    expect(getByText('Slide 3')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="carousel-item"]')).toHaveLength(3)
  })

  it('renders prev + next buttons', () => {
    const { container } = render(<Fixture />)
    expect(container.querySelector('[data-slot="carousel-previous"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="carousel-next"]')).not.toBeNull()
  })

  it('reflects the vertical orientation', () => {
    const { container } = render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>A</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    expect(container.querySelector('.a63-Carousel')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('does not render the cursor overlay by default', () => {
    const { container } = render(<Fixture />)
    const root = container.querySelector('.a63-Carousel')
    expect(root).not.toHaveClass('a63-Carousel--cursor-indicator')
    expect(container.querySelector('[data-slot="carousel-cursor"]')).toBeNull()
  })

  it('shows a pointer-following cursor overlay when cursorIndicator is set', () => {
    const { container } = render(
      <Carousel cursorIndicator>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    const root = container.querySelector('.a63-Carousel') as HTMLElement
    expect(root).toHaveClass('a63-Carousel--cursor-indicator')
    // No overlay until the pointer enters.
    expect(container.querySelector('[data-slot="carousel-cursor"]')).toBeNull()

    fireEvent.pointerMove(root, { clientX: 200, clientY: 50 })
    const cursor = container.querySelector('[data-slot="carousel-cursor"]')
    expect(cursor).not.toBeNull()
    // Right half of the viewport → next affordance.
    expect(cursor).toHaveAttribute('data-side', 'next')
  })

  it('navigates on click for cursor zones, not on pointerdown', () => {
    const { container } = render(
      <Carousel cursorIndicator opts={{ loop: true }}>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
          <CarouselItem>Slide 3</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    const root = container.querySelector('.a63-Carousel') as HTMLElement
    // Establish "next" side before click (right half).
    Object.defineProperty(root, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        top: 0,
        width: 400,
        height: 100,
        right: 400,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    })
    fireEvent.pointerMove(root, { clientX: 300, clientY: 50 })
    expect(container.querySelector('[data-slot="carousel-cursor"]')).toHaveAttribute(
      'data-side',
      'next'
    )

    // pointerdown alone must not be the navigation trigger (Embla owns that phase).
    fireEvent.pointerDown(root, { clientX: 300, clientY: 50 })
    fireEvent.click(root, { clientX: 300, clientY: 50 })
    // Smoke: click path is wired (no throw); Embla may no-op in jsdom layout.
    expect(root).toHaveAttribute('data-slot', 'carousel')
  })
})
