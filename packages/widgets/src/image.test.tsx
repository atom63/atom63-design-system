import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WidgetImage } from './image'

class MockImage {
  static instances: MockImage[] = []
  decoding = 'async'
  naturalWidth = 0
  complete = false
  onload: ((ev?: Event) => void) | null = null
  onerror: ((ev?: Event) => void) | null = null
  #src = ''

  constructor() {
    MockImage.instances.push(this)
  }

  get src() {
    return this.#src
  }

  set src(value: string) {
    this.#src = value
  }

  load() {
    this.complete = true
    this.naturalWidth = 120
    this.onload?.(new Event('load'))
  }
}

describe('WidgetImage', () => {
  const OriginalImage = window.Image

  beforeEach(() => {
    MockImage.instances = []
    vi.stubGlobal('Image', MockImage)
  })

  afterEach(() => {
    window.Image = OriginalImage
  })

  it('mounts the img immediately so covers stay in the DOM', () => {
    const { container } = render(<WidgetImage alt="One" src="/one.jpg" />)

    expect(container.querySelector('img')).toHaveAttribute('src', '/one.jpg')
    expect(container.querySelector('[data-slot="widget-image"]')).toHaveAttribute(
      'data-widget-image-loading',
      'true'
    )
  })

  it('crossfades the next frame over the held poster on shuffle', async () => {
    const { container, rerender } = render(
      <WidgetImage alt="One" crossfade priority src="/one.jpg" />
    )

    expect(container.querySelector('img')).toHaveAttribute('src', '/one.jpg')

    rerender(<WidgetImage alt="Two" crossfade priority src="/two.jpg" />)

    // Previous poster stays painted while the next src preloads.
    expect(container.querySelector('img')).toHaveAttribute('src', '/one.jpg')
    expect(
      container.querySelector('.animate-pulse, [data-slot="skeleton"]')
    ).not.toBeInTheDocument()

    await act(async () => {
      MockImage.instances.at(-1)?.load()
    })

    await waitFor(() => {
      const images = container.querySelectorAll('img')
      expect(images).toHaveLength(2)
      expect(images[0]).toHaveAttribute('src', '/one.jpg')
      expect(images[1]).toHaveAttribute('src', '/two.jpg')
    })
    expect(container.querySelector('[data-slot="widget-image"]')).toHaveAttribute(
      'data-widget-image-crossfade',
      'true'
    )
  })
})
