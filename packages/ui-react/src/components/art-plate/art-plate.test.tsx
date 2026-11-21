import { artPlateContract } from '@atom63/ui-foundation'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ArtPlate } from './art-plate'

describe('ArtPlate', () => {
  it('renders its slots with the contract defaults', () => {
    const { container } = render(
      <ArtPlate alt="Glacier" src="/plate.webp">
        Content
      </ArtPlate>
    )
    const root = container.querySelector('[data-slot="art-plate"]')
    expect(root).toHaveAttribute('data-size', artPlateContract.defaultSize)
    expect(root).toHaveAttribute('data-safe-area', artPlateContract.defaultSafeArea)
    expect(root).toHaveAttribute('data-tone', artPlateContract.defaultTone)
    expect(root).toHaveAttribute('data-veil', artPlateContract.defaultVeil)
    expect(root).not.toHaveAttribute('data-parallax')
    expect(container.querySelector('[data-slot="art-plate-content"]')).toHaveTextContent('Content')
    expect(container.querySelector('[data-slot="art-plate-image"] img')).toHaveAttribute(
      'alt',
      'Glacier'
    )
  })

  it('lazy-loads by default and loads eagerly with high priority above the fold', () => {
    const { container, rerender } = render(<ArtPlate alt="" src="/plate.webp" />)
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy')
    rerender(<ArtPlate alt="" priority src="/plate.webp" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('adds an art-directed phone source and the srcSet candidates', () => {
    const { container } = render(
      <ArtPlate
        alt=""
        src="/plate-1920.webp"
        srcMobile="/plate-mobile.webp"
        srcSet="/plate-960.webp 960w, /plate-1920.webp 1920w"
      />
    )
    expect(container.querySelector('source')).toHaveAttribute('media', '(max-width: 767px)')
    expect(container.querySelector('source')).toHaveAttribute('srcset', '/plate-mobile.webp')
    expect(container.querySelector('img')).toHaveAttribute(
      'srcset',
      '/plate-960.webp 960w, /plate-1920.webp 1920w'
    )
  })

  it('passes the focal points as clamped percentages', () => {
    const { container } = render(
      <ArtPlate alt="" focus={{ x: 0.25, y: 1.4 }} focusMobile={{ x: 0.6, y: 0.3 }} src="/p.webp" />
    )
    const root = container.querySelector<HTMLElement>('[data-slot="art-plate"]')!
    expect(root.style.getPropertyValue('--a63-art-plate-focus')).toBe('25% 100%')
    expect(root.style.getPropertyValue('--a63-art-plate-focus-mobile')).toBe('60% 30%')
  })

  it('omits the content region without children and marks parallax', () => {
    const { container } = render(<ArtPlate alt="" parallax src="/p.webp" />)
    expect(container.querySelector('[data-slot="art-plate-content"]')).toBeNull()
    expect(container.querySelector('[data-slot="art-plate"]')).toHaveAttribute('data-parallax', '')
  })
})
