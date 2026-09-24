import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const reducedMotion = vi.hoisted(() => ({ value: false }))

vi.mock('../../primitives/use-reduced-motion', () => ({
  useMdxReducedMotion: () => reducedMotion.value,
}))

import { resolveActiveStepIndex, ScrollStage } from './scroll-stage'

afterEach(() => {
  reducedMotion.value = false
  vi.restoreAllMocks()
})

describe('resolveActiveStepIndex', () => {
  it('returns 0 for an empty list', () => {
    expect(resolveActiveStepIndex([])).toBe(0)
  })

  it('returns the index of the entry with the greatest ratio', () => {
    expect(
      resolveActiveStepIndex([
        { index: 0, ratio: 0.1 },
        { index: 1, ratio: 0.9 },
        { index: 2, ratio: 0.4 },
      ])
    ).toBe(1)
  })

  it('breaks ties toward the lowest index', () => {
    expect(
      resolveActiveStepIndex([
        { index: 2, ratio: 0.5 },
        { index: 0, ratio: 0.5 },
        { index: 1, ratio: 0.5 },
      ])
    ).toBe(0)
  })
})

describe('ScrollStage', () => {
  it('renders each step prose in the static (reduced-motion) path', () => {
    reducedMotion.value = true
    render(
      <ScrollStage>
        <ScrollStage.Step media={<img alt="first" src="a.png" />}>Step one prose</ScrollStage.Step>
        <ScrollStage.Step media={<img alt="second" src="b.png" />}>Step two prose</ScrollStage.Step>
      </ScrollStage>
    )
    expect(screen.getByText('Step one prose')).toBeInTheDocument()
    expect(screen.getByText('Step two prose')).toBeInTheDocument()
  })

  it('renders each step media inline in the static (reduced-motion) path', () => {
    reducedMotion.value = true
    render(
      <ScrollStage>
        <ScrollStage.Step media={<img alt="first" src="a.png" />}>Step one prose</ScrollStage.Step>
        <ScrollStage.Step media={<img alt="second" src="b.png" />}>Step two prose</ScrollStage.Step>
      </ScrollStage>
    )
    expect(screen.getByAltText('first')).toBeInTheDocument()
    expect(screen.getByAltText('second')).toBeInTheDocument()
  })

  it('renders the not-mdx mdx-block root', () => {
    reducedMotion.value = true
    const { container } = render(
      <ScrollStage>
        <ScrollStage.Step media={<img alt="first" src="a.png" />}>Step one prose</ScrollStage.Step>
      </ScrollStage>
    )
    expect(container.querySelector('.not-mdx.mdx-block')).not.toBeNull()
  })

  it('renders all steps in the motion path too (no prose lost)', () => {
    reducedMotion.value = false
    render(
      <ScrollStage>
        <ScrollStage.Step media={<img alt="first" src="a.png" />}>Step one prose</ScrollStage.Step>
        <ScrollStage.Step media={<img alt="second" src="b.png" />}>Step two prose</ScrollStage.Step>
      </ScrollStage>
    )
    // Prose appears in both the below-lg stacked column and the lg+ reading
    // column (responsive duplication), so at least one of each must be present.
    expect(screen.getAllByText('Step one prose').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Step two prose').length).toBeGreaterThan(0)
  })

  it('disconnects the IntersectionObserver on unmount in the motion path', () => {
    reducedMotion.value = false
    const disconnect = vi.fn()
    const observe = vi.fn()
    class TrackingObserver {
      observe = observe
      unobserve = vi.fn()
      disconnect = disconnect
      takeRecords() {
        return []
      }
    }
    const original = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = TrackingObserver as unknown as typeof IntersectionObserver

    const { unmount } = render(
      <ScrollStage>
        <ScrollStage.Step media={<img alt="first" src="a.png" />}>Step one prose</ScrollStage.Step>
      </ScrollStage>
    )
    expect(observe).toHaveBeenCalled()
    unmount()
    expect(disconnect).toHaveBeenCalled()

    globalThis.IntersectionObserver = original
  })
})
