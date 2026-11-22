import { layeredSceneContract } from '@atom63/ui-foundation'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  LayeredScene,
  LayeredSceneContent,
  LayeredSceneForeground,
  LayeredScenePlate,
  LayeredSceneStage,
} from './layered-scene'

function Scene(props: React.ComponentProps<typeof LayeredScene>) {
  return (
    <LayeredScene {...props}>
      <LayeredScenePlate alt="" src="/plate.webp" />
      <LayeredSceneContent>Headline</LayeredSceneContent>
      <LayeredSceneStage>
        <button type="button">Run</button>
      </LayeredSceneStage>
      <LayeredSceneForeground focus={{ x: 0.5, y: 0.8 }} src="/plate-fg.webp" />
    </LayeredScene>
  )
}

describe('LayeredScene', () => {
  it('renders the layers in order with the contract defaults', () => {
    const { container } = render(<Scene />)
    const root = container.querySelector('[data-slot="layered-scene"]')
    expect(root).toHaveAttribute('data-placement', layeredSceneContract.defaultPlacement)
    expect(root).toHaveAttribute('data-width', layeredSceneContract.defaultWidth)
    const slots = [...(root?.children ?? [])].map(child => child.getAttribute('data-slot'))
    expect(slots).toEqual([
      'art-plate',
      'layered-scene-content',
      'layered-scene-stage',
      'layered-scene-foreground',
    ])
  })

  it('keeps the foreground decorative and inert', () => {
    const { container } = render(<Scene />)
    const foreground = container.querySelector('[data-slot="layered-scene-foreground"]')
    expect(foreground).toHaveAttribute('aria-hidden', 'true')
    expect(foreground).toHaveAttribute('data-phone', 'hide')
    expect(foreground?.querySelector('img')).toHaveAttribute('alt', '')
    expect(foreground?.querySelector('img')).toHaveAttribute('loading', 'lazy')
  })

  it('gives the foreground the plate focal point and phone opt-in', () => {
    const { container } = render(
      <LayeredSceneForeground focus={{ x: 0.5, y: 0.8 }} priority showOnPhone src="/fg.webp" />
    )
    const foreground = container.querySelector<HTMLElement>(
      '[data-slot="layered-scene-foreground"]'
    )!
    expect(foreground.style.getPropertyValue('--a63-art-plate-focus')).toBe('50% 80%')
    expect(foreground).toHaveAttribute('data-phone', 'show')
    expect(foreground.querySelector('img')).toHaveAttribute('loading', 'eager')
  })

  it('applies placement and width', () => {
    const { container } = render(<Scene placement="end-bottom" width="half" />)
    const root = container.querySelector('[data-slot="layered-scene"]')
    expect(root).toHaveAttribute('data-placement', 'end-bottom')
    expect(root).toHaveAttribute('data-width', 'half')
  })
})
