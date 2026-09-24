'use client'

import { Children, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'motion/react'
import { usePortalContainer } from '../../../components/portal-container'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { resolveLabels } from '../labels'
import type { LightboxTiming } from '../timing'
import type {
  MediaLightboxAppearance,
  MediaLightboxItem,
  MediaLightboxLabels,
  MediaLightboxTransition,
} from '../types'
import { whenMediaViewTransitionSettles } from '../view-transition'
import { LightboxConfigContext, LightboxStateContext, useLightboxConfig } from './context'
import { LightboxRefsContext } from './refs'
import { LightboxThumbnailsRegistryProvider } from './thumbnails-registry'
import { IDLE_ZOOM_API, LightboxZoomRegistryProvider } from './zoom-registry'

export interface LightboxRootProps {
  items: readonly MediaLightboxItem[]
  index: number
  open: boolean
  onIndexChange: (index: number) => void
  onOpenChange: (open: boolean) => void
  onAppearanceChange?: (id: string, appearance: MediaLightboxAppearance) => void
  appearance?: Record<string, MediaLightboxAppearance>
  labels?: Partial<MediaLightboxLabels>
  origin?: HTMLElement | null
  preload?: number
  transition?: MediaLightboxTransition
  timing?: LightboxTiming
  children: ReactNode
}

export interface LightboxPortalProps {
  children: ReactNode
  /** 关闭形变结束、overlay 已离开 DOM 后触发。 */
  onExitComplete?: () => void
}

export function LightboxRoot({
  appearance,
  children,
  index,
  items,
  labels: labelOverrides,
  onAppearanceChange,
  onIndexChange,
  onOpenChange,
  open,
  origin,
  preload = 1,
  timing = 'default',
  transition = 'flip',
}: LightboxRootProps) {
  const reducedMotion = useReducedMotion()
  const [zoomApi, setZoomApi] = useState(IDLE_ZOOM_API)

  const labels = useMemo(() => resolveLabels(labelOverrides), [labelOverrides])

  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<HTMLDivElement>(null)

  const refs = useMemo(
    () => ({
      backdropRef,
      mediaRef,
      rootRef,
      stageRef,
      trackRef,
      zoomRef,
    }),
    []
  )

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= items.length) {
        return
      }
      onIndexChange(nextIndex)
    },
    [items.length, onIndexChange]
  )

  const close = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const config = useMemo(
    () => ({
      appearance,
      items,
      labels,
      onAppearanceChange,
      open,
      origin,
      preload,
      reducedMotion,
      timing,
      transition,
    }),
    [
      appearance,
      items,
      labels,
      onAppearanceChange,
      open,
      origin,
      preload,
      reducedMotion,
      timing,
      transition,
    ]
  )

  const state = useMemo(
    () => ({
      close,
      goTo,
      index,
      isZoomed: zoomApi.isZoomed,
      itemCount: items.length,
      zoomIn: zoomApi.zoomIn,
      zoomOut: zoomApi.zoomOut,
    }),
    [close, goTo, index, items.length, zoomApi]
  )

  return (
    <LightboxThumbnailsRegistryProvider>
      <LightboxZoomRegistryProvider value={setZoomApi}>
        <LightboxConfigContext.Provider value={config}>
          <LightboxStateContext.Provider value={state}>
            <LightboxRefsContext.Provider value={refs}>{children}</LightboxRefsContext.Provider>
          </LightboxStateContext.Provider>
        </LightboxConfigContext.Provider>
      </LightboxZoomRegistryProvider>
    </LightboxThumbnailsRegistryProvider>
  )
}

export function LightboxPortal({ children, onExitComplete }: LightboxPortalProps) {
  const { open, transition } = useLightboxConfig()
  const portalContainer = usePortalContainer()
  const viewTransition = transition === 'view-transition'
  const wasOpenRef = useRef(open)

  // The view-transition path has no `AnimatePresence` to report from — the
  // browser owns that exit, so its settle promise is what "finished" means.
  useEffect(() => {
    const wasOpen = wasOpenRef.current
    wasOpenRef.current = open
    if (!viewTransition || open || !wasOpen) {
      return
    }
    let cancelled = false
    void whenMediaViewTransitionSettles().then(() => {
      if (!cancelled) {
        onExitComplete?.()
      }
    })
    return () => {
      cancelled = true
    }
  }, [onExitComplete, open, viewTransition])

  if (typeof document === 'undefined') {
    return null
  }

  // `open` gates the *child*, not this component: `AnimatePresence` needs to
  // stay mounted across the transition from present to absent to run its exit
  // animation at all. A view transition captures the new state right after the
  // update that closes the lightbox, so that unmount has to be synchronous —
  // `AnimatePresence` holding children back for an exit animation would leave
  // the lightbox in the new snapshot and make the browser skip the transition
  // entirely. `toArray` keys the children by position: `AnimatePresence`
  // tracks each direct child by key, and the backdrop and content arrive
  // unkeyed as siblings.
  const content = open ? Children.toArray(children) : null

  return createPortal(
    viewTransition ? (
      content
    ) : (
      <AnimatePresence onExitComplete={onExitComplete}>{content}</AnimatePresence>
    ),
    portalContainer ?? document.body
  )
}
