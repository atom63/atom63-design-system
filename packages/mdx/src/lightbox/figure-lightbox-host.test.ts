// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from './constants'
import { resolveLightboxTrigger } from './figure-lightbox-host'
import { collectFigureLightboxImages } from './open-lightbox'

describe('figure lightbox gallery routing', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('resolves triggers regardless of custom gallery id', () => {
    document.body.innerHTML = `
      <button data-pswp-src="/a.webp" data-pswp-width="100" data-pswp-height="80" data-gallery-id="grid-abc" type="button">
        <img alt="" src="/a.webp" />
      </button>
    `
    const img = document.querySelector('img')
    expect(img).toBeTruthy()
    const trigger = resolveLightboxTrigger(img as Element)
    expect(trigger?.getAttribute('data-gallery-id')).toBe('grid-abc')
  })

  it('collects only images that share the clicked trigger gallery', () => {
    document.body.innerHTML = `
      <button data-pswp-src="/a.webp" data-pswp-width="100" data-pswp-height="80" data-gallery-id="grid-1" type="button">A</button>
      <button data-pswp-src="/b.webp" data-pswp-width="100" data-pswp-height="80" data-gallery-id="grid-1" type="button">B</button>
      <button data-pswp-src="/c.webp" data-pswp-width="100" data-pswp-height="80" data-gallery-id="media-block-/c.webp" type="button">C</button>
      <button data-pswp-src="/d.webp" data-pswp-width="100" data-pswp-height="80" data-gallery-id="${MDX_FIGURE_LIGHTBOX_GALLERY_ID}" type="button">D</button>
    `
    const second = document.querySelector<HTMLElement>('button[data-pswp-src="/b.webp"]')
    expect(second).toBeTruthy()
    const { images, index } = collectFigureLightboxImages('grid-1', second as HTMLElement)
    expect(images.map(image => image.src)).toEqual(['/a.webp', '/b.webp'])
    expect(index).toBe(1)
  })
})
