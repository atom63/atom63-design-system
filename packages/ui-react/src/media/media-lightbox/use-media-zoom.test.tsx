import { act, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useMediaZoom } from './use-media-zoom'

function setup(options: Partial<Parameters<typeof useMediaZoom>[0]> = {}) {
  const zoom = document.createElement('div')
  const track = document.createElement('div')
  document.body.append(track)
  track.append(zoom)

  const zoomRef = createRef<HTMLDivElement>()
  const trackRef = createRef<HTMLDivElement>()
  Object.assign(zoomRef, { current: zoom })
  Object.assign(trackRef, { current: track })

  return renderHook(
    currentOptions =>
      useMediaZoom({
        enabled: true,
        index: 0,
        reducedMotion: true,
        trackRef,
        zoomRef,
        ...currentOptions,
      }),
    { initialProps: options }
  )
}

describe('useMediaZoom configuration', () => {
  it('reports zoom changes to the caller', () => {
    const onZoomChange = vi.fn()
    const { result } = setup({ onZoomChange })

    act(() => {
      result.current.zoomIn()
    })

    // 默认 zoomStep 为 2，所以第一步从 1 走到 2。
    expect(onZoomChange).toHaveBeenCalledWith(2)
  })

  it('honours a custom zoomStep', () => {
    const onZoomChange = vi.fn()
    const { result } = setup({ onZoomChange, zoomStep: 3 })

    act(() => {
      result.current.zoomIn()
    })

    expect(onZoomChange).toHaveBeenCalledWith(3)
  })

  it('refuses to exceed maxZoom', () => {
    const onZoomChange = vi.fn()
    const { result } = setup({ maxZoom: 2, onZoomChange, zoomStep: 10 })

    act(() => {
      result.current.zoomIn()
    })

    expect(onZoomChange).toHaveBeenLastCalledWith(2)
  })

  it('reports the reset scale after a slide change', () => {
    const onZoomChange = vi.fn()
    const { result, rerender } = setup({ index: 0, minZoom: 2, onZoomChange, zoomStep: 3 })

    act(() => {
      result.current.zoomIn()
    })

    act(() => {
      rerender({ index: 1, minZoom: 2, onZoomChange, zoomStep: 3 })
    })

    expect(onZoomChange).toHaveBeenLastCalledWith(2)
  })
})
