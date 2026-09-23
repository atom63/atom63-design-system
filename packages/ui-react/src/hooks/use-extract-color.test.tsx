import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ExtractedColor } from '../lib/extract-color'

const extraction = vi.hoisted(() => ({
  colorCacheKey: vi.fn((url: string, region: string) => `${url}::${region}`),
  getCachedColor: vi.fn(),
  loadAndExtractColor: vi.fn(),
}))

vi.mock('../lib/extract-color', () => extraction)

import { useExtractColor } from './use-extract-color'

const blue: ExtractedColor = {
  css: '10 20 30',
  darker: '4 8 12',
  raw: { r: 10, g: 20, b: 30 },
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  vi.clearAllMocks()
  extraction.getCachedColor.mockReturnValue(null)
})

describe('useExtractColor', () => {
  it('starts loading and settles with an extracted color', async () => {
    const request = deferred<ExtractedColor>()
    extraction.loadAndExtractColor.mockReturnValue(request.promise)
    const { result } = renderHook(() => useExtractColor('/media/blue.jpg'))

    expect(result.current).toEqual({ color: null, loading: true, error: null })
    expect(extraction.loadAndExtractColor).toHaveBeenCalledWith('/media/blue.jpg', {
      crossOrigin: 'anonymous',
      maxSize: 16,
      sampleRegion: 'full',
      similarityThreshold: 50,
    })

    await act(async () => request.resolve(blue))

    expect(result.current).toEqual({
      color: blue,
      loading: false,
      error: null,
    })
  })

  it('uses cached color as its initial state without starting another load', () => {
    extraction.getCachedColor.mockReturnValue(blue)

    const { result } = renderHook(() =>
      useExtractColor('/media/cached.jpg', { sampleRegion: 'top' })
    )

    expect(result.current).toEqual({
      color: blue,
      loading: false,
      error: null,
    })
    expect(extraction.getCachedColor).toHaveBeenCalledWith('/media/cached.jpg', 'top')
    expect(extraction.loadAndExtractColor).not.toHaveBeenCalled()
  })

  it('records image loading failures', async () => {
    extraction.loadAndExtractColor.mockRejectedValue(new Error('CORS denied'))
    const { result } = renderHook(() => useExtractColor('https://cross-origin.test/image.jpg'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.color).toBeNull()
    expect(result.current.error).toEqual(new Error('CORS denied'))
  })

  it('ignores a stale result after the URL changes', async () => {
    const first = deferred<ExtractedColor>()
    const second = deferred<ExtractedColor>()
    extraction.loadAndExtractColor.mockImplementation((url: string) =>
      url.endsWith('first.jpg') ? first.promise : second.promise
    )
    const { result, rerender } = renderHook(({ url }) => useExtractColor(url), {
      initialProps: { url: '/media/first.jpg' },
    })

    rerender({ url: '/media/second.jpg' })
    await act(async () => first.resolve(blue))

    expect(result.current).toEqual({ color: null, loading: true, error: null })

    const red: ExtractedColor = {
      css: '80 20 10',
      darker: '24 6 3',
      raw: { r: 80, g: 20, b: 10 },
    }
    await act(async () => second.resolve(red))

    expect(result.current).toEqual({ color: red, loading: false, error: null })
  })
})
