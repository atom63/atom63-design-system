import type { MediaLightboxLabels } from './types'

/**
 * English defaults so the common case needs no wiring. A localized surface
 * passes `labels` and overrides only the pieces it needs.
 */
export const DEFAULT_MEDIA_LIGHTBOX_LABELS: MediaLightboxLabels = {
  appearance: (title, target) => `Show ${target} version of ${title}`,
  carousel: 'carousel',
  close: 'Close media viewer',
  gallery: 'Media',
  next: 'Next media',
  openDestination: title => `Open ${title}`,
  position: (index, total) => `${index + 1} of ${total}`,
  previous: 'Previous media',
  slide: 'slide',
  thumbnails: 'Choose media',
  view: title => `View ${title}`,
  zoomIn: title => `Zoom into ${title}`,
  zoomOut: title => `Zoom out of ${title}`,
}

export function resolveLabels(
  overrides: Partial<MediaLightboxLabels> | undefined
): MediaLightboxLabels {
  return overrides
    ? { ...DEFAULT_MEDIA_LIGHTBOX_LABELS, ...overrides }
    : DEFAULT_MEDIA_LIGHTBOX_LABELS
}
