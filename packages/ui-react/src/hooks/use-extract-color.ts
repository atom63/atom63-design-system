import { useEffect, useState } from 'react'
import {
  type ColorSampleRegion,
  colorCacheKey,
  type ExtractedColor,
  getCachedColor,
  loadAndExtractColor,
} from '../lib/extract-color'

export interface UseExtractColorOptions {
  crossOrigin?: string
  maxSize?: number
  sampleRegion?: ColorSampleRegion
  similarityThreshold?: number
}

export interface UseExtractColorReturn {
  color: ExtractedColor | null
  error: Error | null
  loading: boolean
}

/**
 * Extract the dominant color of `imageUrl`, fetching the image to do it.
 *
 * This is the right hook when nothing else is already loading that image. If
 * the image is rendered on screen — a card that just fired `onLoad` — call
 * `extractColorFromLoadedImage` on the element instead: this hook's request is
 * separate from the element's, so using it across a lazy-loaded list pulls
 * every full-size source up front.
 */
export function useExtractColor(
  imageUrl: string,
  options: UseExtractColorOptions = {}
): UseExtractColorReturn {
  const {
    maxSize = 16,
    sampleRegion = 'full',
    similarityThreshold = 50,
    crossOrigin = 'anonymous',
  } = options

  const key = colorCacheKey(imageUrl, sampleRegion)

  const [state, setState] = useState<UseExtractColorReturn>(() => {
    const cached = getCachedColor(imageUrl, sampleRegion)
    return { color: cached, loading: !cached, error: null }
  })

  useEffect(() => {
    const cached = getCachedColor(imageUrl, sampleRegion)
    if (cached) {
      setState({ color: cached, loading: false, error: null })
      return
    }

    let cancelled = false
    setState(s => (s.loading ? s : { ...s, loading: true }))

    loadAndExtractColor(imageUrl, {
      maxSize,
      sampleRegion,
      similarityThreshold,
      crossOrigin,
    })
      .then(result => {
        if (!cancelled) setState({ color: result, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState(s => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err : new Error('Unknown error'),
          }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [key, imageUrl, maxSize, sampleRegion, similarityThreshold, crossOrigin])

  return state
}
