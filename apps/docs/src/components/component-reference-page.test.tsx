import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { componentCatalogItems } from '../lib/component-catalog'
import { ComponentPreview } from './component-reference-page'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

class NoopObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver

if (typeof Element.prototype.getAnimations !== 'function') {
  Element.prototype.getAnimations = () => []
}

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    addEventListener: () => {},
    addListener: () => {},
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia
}

async function waitForPreview(container: HTMLElement) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (!container.querySelector('[aria-label="Loading representative preview"]')) {
      return
    }
    await act(async () => {
      await new Promise(resolve => window.setTimeout(resolve, 10))
    })
  }
  throw new Error('Representative preview did not finish loading')
}

describe('generated component references', () => {
  it('renders every representative story without falling back to an error state', async () => {
    for (const item of componentCatalogItems) {
      const container = document.createElement('div')
      document.body.append(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(<ComponentPreview previewProfile={item.previewProfile} slug={item.slug} />)
      })
      await waitForPreview(container)

      expect(container.textContent, `${item.slug} preview`).not.toMatch(
        /representative preview could not be rendered/i
      )
      expect(container.textContent, `${item.slug} story`).not.toMatch(
        /representative story is unavailable/i
      )
      expect(container.textContent, `${item.slug} story module`).not.toMatch(
        /no co-located representative story/i
      )
      expect(
        container.querySelector('[data-preview-profile]'),
        `${item.slug} preview container`
      ).not.toBeNull()
      expect(container.querySelector('.doc-example'), `${item.slug} example shell`).not.toBeNull()
      expect(
        container.querySelector('[data-component-preview-stage]'),
        `${item.slug} scroll-safe stage`
      ).not.toBeNull()
      expect(
        container.querySelector('[role="tab"][aria-selected="true"]')?.textContent,
        `${item.slug} preview tab`
      ).toBe('Preview')
      expect(container.textContent, `${item.slug} source tab`).toContain('Story source')

      await act(async () => {
        root.unmount()
      })
      container.remove()
    }
  }, 120_000)
})
