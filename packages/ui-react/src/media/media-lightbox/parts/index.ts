'use client'

/**
 * The public surface of the headless lightbox parts.
 *
 * `zoom-registry.ts`, `thumbnails-registry.ts`, and `zoom-options.ts` are
 * internal wiring between parts and are deliberately not re-exported here —
 * see their own file headers.
 */
export type { LightboxConfig, LightboxSlide as LightboxSlideValue, LightboxState } from './context'
export {
  useLightboxConfig,
  useLightboxSlide,
  useLightboxState,
  useOptionalLightboxConfig,
} from './context'
export type { LightboxRefs } from './refs'
export { useLightboxRefs } from './refs'
export type { LightboxPortalProps, LightboxRootProps } from './root'
export { LightboxPortal, LightboxRoot } from './root'
export type { LightboxBackdropProps, LightboxContentProps, LightboxStatusProps } from './content'
export { LightboxBackdrop, LightboxContent, LightboxStatus } from './content'
export type { LightboxSlideProps, LightboxSlidesProps, LightboxViewportProps } from './slides'
export { LightboxSlide, LightboxSlides, LightboxViewport } from './slides'
export type { LightboxFrameProps, LightboxZoomProps } from './frame'
export { LightboxFrame, LightboxMedia, LightboxZoom } from './frame'
export type {
  LightboxCaptionProps,
  LightboxCloseProps,
  LightboxCounterProps,
  LightboxNextProps,
  LightboxPreviousProps,
} from './chrome'
export {
  LightboxCaption,
  LightboxClose,
  LightboxCounter,
  LightboxNext,
  LightboxPrevious,
} from './chrome'
export type { LightboxZoomInProps, LightboxZoomOutProps } from './zoom-controls'
export { LightboxZoomIn, LightboxZoomOut } from './zoom-controls'
export type {
  LightboxThumbnailContextValue,
  LightboxThumbnailProps,
  LightboxThumbnailsProps,
} from './thumbnails'
export { LightboxThumbnail, LightboxThumbnails } from './thumbnails'
export type { LightboxAppearanceToggleProps, LightboxDestinationProps } from './extras'
export { LightboxAppearanceToggle, LightboxDestination } from './extras'

import {
  LightboxCaption,
  LightboxClose,
  LightboxCounter,
  LightboxNext,
  LightboxPrevious,
} from './chrome'
import { LightboxBackdrop, LightboxContent, LightboxStatus } from './content'
import { LightboxAppearanceToggle, LightboxDestination } from './extras'
import { LightboxFrame, LightboxMedia, LightboxZoom } from './frame'
import { LightboxPortal, LightboxRoot } from './root'
import { LightboxSlide, LightboxSlides, LightboxViewport } from './slides'
import { LightboxThumbnail, LightboxThumbnails } from './thumbnails'
import { LightboxZoomIn, LightboxZoomOut } from './zoom-controls'

/**
 * Every headless lightbox part, namespaced the way `Dialog.Root` /
 * `Dialog.Trigger` are in Radix / Base UI. The next task composes exactly
 * this set to rebuild the monolith's default appearance.
 */
export const Lightbox = {
  AppearanceToggle: LightboxAppearanceToggle,
  Backdrop: LightboxBackdrop,
  Caption: LightboxCaption,
  Close: LightboxClose,
  Content: LightboxContent,
  Counter: LightboxCounter,
  Destination: LightboxDestination,
  Frame: LightboxFrame,
  Media: LightboxMedia,
  Next: LightboxNext,
  Portal: LightboxPortal,
  Previous: LightboxPrevious,
  Root: LightboxRoot,
  Slide: LightboxSlide,
  Slides: LightboxSlides,
  Status: LightboxStatus,
  Thumbnail: LightboxThumbnail,
  Thumbnails: LightboxThumbnails,
  Viewport: LightboxViewport,
  Zoom: LightboxZoom,
  ZoomIn: LightboxZoomIn,
  ZoomOut: LightboxZoomOut,
} as const
// Types that appear in the parts' public props. Only the types leave these
// modules; the registries and option plumbing stay internal.
export type { LightboxTiming } from '../timing'
export type {
  MediaLightboxAppearance,
  MediaLightboxItem,
  MediaLightboxItemKind,
  MediaLightboxLabels,
  MediaLightboxTransition,
  MediaLightboxVideoSource,
  MediaLightboxVideoTrack,
} from '../types'
export type { LightboxZoomOptions } from './zoom-options'
