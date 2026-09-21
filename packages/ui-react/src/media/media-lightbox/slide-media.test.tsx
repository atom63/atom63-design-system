import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { resolveMediaSrc, resolveThumbSrc, SlideMedia } from './slide-media'
import type { MediaLightboxItem } from './types'

const base: MediaLightboxItem = { alt: 'Ribbon', id: 'ribbon', title: 'Ribbon' }

describe('resolveThumbSrc', () => {
  it('follows the appearance the photo is showing', () => {
    const item = {
      ...base,
      thumbDarkSrc: '/thumb-dark.webp',
      thumbLightSrc: '/thumb-light.webp',
    }

    expect(resolveThumbSrc(item, 'light')).toBe('/thumb-light.webp')
    expect(resolveThumbSrc(item, 'dark')).toBe('/thumb-dark.webp')
    // Dark is the default, the same way the full-size resolver treats it.
    expect(resolveThumbSrc(item, undefined)).toBe('/thumb-dark.webp')
  })

  it('takes a single thumbnail when there are no variants', () => {
    expect(resolveThumbSrc({ ...base, thumbSrc: '/thumb.webp' }, 'light')).toBe('/thumb.webp')
  })

  it('says nothing when the caller supplied none', () => {
    expect(resolveThumbSrc({ ...base, src: '/full.webp' }, 'dark')).toBeUndefined()
  })

  it('leaves the full-size resolver alone', () => {
    const item = {
      ...base,
      darkSrc: '/dark.webp',
      lightSrc: '/light.webp',
      thumbDarkSrc: '/thumb-dark.webp',
      thumbLightSrc: '/thumb-light.webp',
    }

    expect(resolveMediaSrc(item, 'light')).toBe('/light.webp')
    expect(resolveMediaSrc(item, 'dark')).toBe('/dark.webp')
  })
})

describe('SlideMedia layering', () => {
  const item: MediaLightboxItem = {
    alt: 'Ribbon',
    id: 'ribbon',
    src: '/ribbon.webp',
    title: 'Ribbon',
  }

  /**
   * A positioned element paints above unpositioned content in the same stacking
   * context however the DOM is ordered. When only the placeholder was
   * positioned it sat on top of the photograph it was standing in for, and the
   * lightbox showed a 160px thumbnail, stretched, forever. jsdom has no paint
   * order to assert against, so this locks the arrangement that produces one.
   */
  it('keeps the photo above its placeholder', () => {
    const { container } = render(
      <SlideMedia active filled item={item} src="/ribbon.webp" thumbSrc="/ribbon-thumb.webp" />
    )

    const images = [...container.querySelectorAll('img')]
    expect(images).toHaveLength(2)

    const [placeholder, photo] = images
    expect(placeholder?.dataset.slot).toBe('media-lightbox-placeholder')
    expect(photo?.dataset.slot).toBe('media-lightbox-image')
    // Both positioned, so the later one wins; either alone re-creates the bug.
    expect(placeholder?.className).toContain('absolute')
    expect(photo?.className).toContain('absolute')
  })

  it('renders one image when there is nothing to stand in for it', () => {
    const { container } = render(<SlideMedia active item={item} src="/ribbon.webp" />)

    expect(container.querySelectorAll('img')).toHaveLength(1)
  })
})
