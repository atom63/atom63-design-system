import { fireEvent, render, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MediaLightboxZoomCursor, useMediaLightboxZoomCursor } from './zoom-cursor'

function Harness({ exclude }: { exclude?: boolean }) {
  const excludeRef = useRef<HTMLAnchorElement>(null)
  const zoomCursor = useMediaLightboxZoomCursor({
    excludeRefs: exclude ? [excludeRef] : undefined,
  })

  return (
    <div>
      {exclude ? (
        <a href="/project" ref={excludeRef}>
          Destination
        </a>
      ) : null}
      <button type="button" {...zoomCursor.targetProps}>
        Open
        <MediaLightboxZoomCursor
          active={zoomCursor.active}
          x={zoomCursor.overlay.x}
          y={zoomCursor.overlay.y}
        />
      </button>
    </div>
  )
}

describe('MediaLightboxZoomCursor', () => {
  it('follows the pointer with a plus overlay and hides on leave', async () => {
    const { container, getByRole } = render(<Harness />)
    const trigger = getByRole('button', { name: 'Open' })
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
      height: 100,
      left: 0,
      right: 200,
      toJSON: () => ({}),
      top: 0,
      width: 200,
      x: 0,
      y: 0,
    })

    expect(container.querySelector('[data-slot="media-lightbox-zoom-cursor"]')).toBeNull()

    fireEvent.pointerMove(trigger, { clientX: 40, clientY: 25, pointerType: 'mouse' })
    expect(container.querySelector('[data-slot="media-lightbox-zoom-cursor"]')).not.toBeNull()
    expect(trigger).toHaveAttribute('data-zoom-cursor-active')

    fireEvent.pointerDown(trigger)
    await waitFor(() => {
      expect(container.querySelector('[data-slot="media-lightbox-zoom-cursor"]')).toBeNull()
    })

    fireEvent.pointerLeave(trigger)
    await waitFor(() => {
      expect(container.querySelector('[data-slot="media-lightbox-zoom-cursor"]')).toBeNull()
    })
  })

  it('ignores touch so a swipe does not show the plus', () => {
    const { container, getByRole } = render(<Harness />)
    fireEvent.pointerMove(getByRole('button', { name: 'Open' }), {
      clientX: 40,
      clientY: 25,
      pointerType: 'touch',
    })
    expect(container.querySelector('[data-slot="media-lightbox-zoom-cursor"]')).toBeNull()
  })

  it('hides the plus when the pointer is over excluded chrome', async () => {
    const { container, getByRole } = render(<Harness exclude />)
    const trigger = getByRole('button', { name: 'Open' })
    const destination = getByRole('link', { name: 'Destination' })
    vi.spyOn(destination, 'getBoundingClientRect').mockReturnValue({
      bottom: 64,
      height: 64,
      left: 136,
      right: 200,
      toJSON: () => ({}),
      top: 0,
      width: 64,
      x: 136,
      y: 0,
    })

    fireEvent.pointerMove(trigger, { clientX: 40, clientY: 50, pointerType: 'mouse' })
    expect(container.querySelector('[data-slot="media-lightbox-zoom-cursor"]')).not.toBeNull()

    fireEvent.pointerMove(trigger, { clientX: 180, clientY: 20, pointerType: 'mouse' })
    await waitFor(() => {
      expect(container.querySelector('[data-slot="media-lightbox-zoom-cursor"]')).toBeNull()
    })
  })
})
