import type * as React from 'react'

/** Media kinds the lightbox presents natively. Anything else uses `render`. */
export type MediaLightboxItemKind = 'image' | 'video'

export interface MediaLightboxVideoSource {
  src: string
  /** Omit to let the browser sniff it. */
  type?: string
}

/** A WebVTT track: captions, subtitles, descriptions. */
export interface MediaLightboxVideoTrack {
  src: string
  srcLang: string
  label: string
  kind?: 'captions' | 'subtitles' | 'descriptions' | 'chapters' | 'metadata'
  default?: boolean
}

export type MediaLightboxAppearance = 'light' | 'dark'

/**
 * Which engine animates between the thumbnail and the enlarged media.
 *
 * `flip` measures both boxes and animates only the photo — the default, because
 * a view transition snapshots the whole document. `view-transition` morphs the
 * thumbnail's crop through the View Transitions API; opt in via
 * `useMediaLightbox(n, { morph: 'view-transition' })`.
 */
export type MediaLightboxTransition = 'flip' | 'view-transition'

export interface MediaLightboxItem {
  /** Stable identity — pairs the thumbnail and the enlarged media. */
  id: string
  alt: string
  title: string
  kind?: MediaLightboxItemKind
  /** Single-source media when light/dark variants are not provided. */
  src?: string
  lightSrc?: string
  darkSrc?: string
  /**
   * A small stand-in for the same picture.
   *
   * Does two jobs, both of which the full-size file does badly. The thumbnail
   * strip draws into a box a few dozen pixels wide, where decoding a wallpaper
   * costs millions of pixels for thousands of pixels of result; and the
   * enlarged media has nothing to show until it decodes, where this gives the
   * real picture at the real aspect ratio almost immediately. Omit it and both
   * fall back to the full-size source.
   */
  thumbSrc?: string
  thumbLightSrc?: string
  thumbDarkSrc?: string
  /** Responsive sources for the enlarged image. */
  srcSet?: string
  sizes?: string
  /** Frame shown before a video plays, and the box the morph animates into. */
  poster?: string
  sources?: readonly MediaLightboxVideoSource[]
  /** Captions and subtitles. Only the caller has these; nothing can invent them. */
  tracks?: readonly MediaLightboxVideoTrack[]
  /** Shown under the media. Defaults to nothing — `alt` is not a caption. */
  caption?: string
  /**
   * Escape hatch for content the lightbox has no opinion about: a 3D viewer, an
   * embed, any React tree. Takes precedence over `kind`.
   */
  render?: React.ReactNode
  /** Secondary destination, surfaced as an icon button inside the lightbox. */
  href?: string
  /** Router link element for internal destinations. */
  renderHref?: React.ReactElement
}

/**
 * Every user-facing string the lightbox speaks.
 *
 * Package-owned UI must not hard-code copy: this repo ships a Chinese locale,
 * and an English "carousel" announced into Chinese speech is worse than saying
 * nothing. Defaults are English so the common case needs no wiring; pass the
 * pieces a localized surface needs.
 */
export interface MediaLightboxLabels {
  close: string
  previous: string
  next: string
  /** Names the slide track. Leave the word "carousel" out — the role says it. */
  gallery: string
  /** Translated `aria-roledescription` for the track. */
  carousel: string
  /** Translated `aria-roledescription` for each slide. */
  slide: string
  /** Names the thumbnail tablist. */
  thumbnails: string
  /** Names the thumbnail that opens the lightbox. */
  view: (title: string) => string
  /** e.g. `3 of 7`. Also the visible counter. */
  position: (index: number, total: number) => string
  zoomIn: (title: string) => string
  zoomOut: (title: string) => string
  /** `target` is the appearance a press switches TO. */
  appearance: (title: string, target: MediaLightboxAppearance) => string
  openDestination: (title: string) => string
}

export interface MediaLightboxProps {
  items: readonly MediaLightboxItem[]
  open: boolean
  index: number
  onIndexChange: (index: number) => void
  onOpenChange: (open: boolean) => void
  /**
   * The element the enlarged media should grow out of. Without it the lightbox
   * cross-fades in, which is also the fallback when the element has scrolled
   * out of view by the time the lightbox closes.
   */
  origin?: HTMLElement | null
  /** Defaults to `flip`. Pass `useMediaLightbox`'s `transition` to opt in. */
  transition?: MediaLightboxTransition
  /**
   * Per-item light/dark selection, owned by the caller so the thumbnail and the
   * lightbox read the same truth. Omit to hide the variant toggle.
   */
  appearance?: Record<string, MediaLightboxAppearance>
  onAppearanceChange?: (id: string, appearance: MediaLightboxAppearance) => void
  className?: string
  /** Overrides for the strings the lightbox speaks. */
  labels?: Partial<MediaLightboxLabels>
  /**
   * Fires once the closing morph has finished and the overlay has left the DOM.
   *
   * The thumbnail has to hold still — no hover scale, no focus ring growth —
   * for as long as the media is flying back to it, and only the lightbox knows
   * when that is. Without this the caller is left guessing with a timer that
   * silently drifts from the animation it is guessing about.
   */
  onExitComplete?: () => void
  /** Show a tablist of thumbnails. Ignored for a single item. */
  thumbnails?: boolean
  /**
   * How many slides either side of the active one keep their media mounted.
   * Slide boxes always render so the scroll extent stays right; only the media
   * inside them is gated. Defaults to 1 — enough that a swipe never reveals an
   * empty frame, few enough that a long gallery cannot pin hundreds of
   * megabytes of decoded bitmap.
   */
  preload?: number
}
