import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Image } from './image'

describe('Image responsive path', () => {
  it('renders a native picture with art-directed sources when srcSet is given', () => {
    const { container } = render(
      <Image
        alt="Studio"
        sizes="100vw"
        sources={[{ media: '(max-width: 767px)', srcSet: '/m-640.webp 640w' }]}
        src="/d-1920.webp"
        srcSet="/d-960.webp 960w, /d-1920.webp 1920w"
      />
    )
    const source = container.querySelector('picture > source')
    const img = container.querySelector('picture > img')
    expect(source).toHaveAttribute('media', '(max-width: 767px)')
    expect(source).toHaveAttribute('srcset', '/m-640.webp 640w')
    expect(img).toHaveAttribute('src', '/d-1920.webp')
    expect(img).toHaveAttribute('srcset', '/d-960.webp 960w, /d-1920.webp 1920w')
    expect(img).toHaveAttribute('sizes', '100vw')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('alt', 'Studio')
  })

  it('loads eagerly with high fetch priority for an above-the-fold image', () => {
    const { container } = render(
      <Image fetchPriority="high" priority src="/a.webp" srcSet="/a.webp 1x" />
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('reserves a fixed ratio inline and none for fill', () => {
    const { container: ratio } = render(
      <Image aspectRatio="21/9" src="/a.webp" srcSet="/a.webp 1x" />
    )
    expect((ratio.firstElementChild as HTMLElement).style.aspectRatio).toBe('21 / 9')
    const { container: fill } = render(
      <Image aspectRatio="fill" src="/a.webp" srcSet="/a.webp 1x" />
    )
    expect((fill.firstElementChild as HTMLElement).style.aspectRatio).toBe('')
  })

  it('hands errors to onError instead of showing the error text', () => {
    const onError = vi.fn()
    const { container, queryByText } = render(
      <Image onError={onError} src="/missing.webp" srcSet="/missing.webp 1x" />
    )
    fireEvent.error(container.querySelector('img') as HTMLImageElement)
    expect(onError).toHaveBeenCalledOnce()
    expect(queryByText('Failed to load image')).toBeNull()
  })

  it('keeps the preloaded path when only src is given', () => {
    const { container } = render(<Image src="/a.webp" />)
    expect(container.querySelector('picture')).toBeNull()
  })
})
