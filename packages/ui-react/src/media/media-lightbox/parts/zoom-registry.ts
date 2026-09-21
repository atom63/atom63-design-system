'use client'

import {
  createElement,
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

/**
 * Internal wiring between Root and Content for zoom state registration.
 * Do not re-export this module from the public parts barrel.
 */
export interface LightboxZoomApi {
  isZoomed: boolean
  zoomIn: () => void
  zoomOut: () => void
}

export const IDLE_ZOOM_API: LightboxZoomApi = {
  isZoomed: false,
  zoomIn: () => {},
  zoomOut: () => {},
}

const LightboxZoomRegistryContext = createContext<Dispatch<SetStateAction<LightboxZoomApi>> | null>(
  null
)

export function LightboxZoomRegistryProvider({
  children,
  value,
}: {
  children: ReactNode
  value: Dispatch<SetStateAction<LightboxZoomApi>>
}) {
  return createElement(LightboxZoomRegistryContext.Provider, { value }, children)
}

export function useLightboxZoomRegistry(): Dispatch<SetStateAction<LightboxZoomApi>> {
  const registerZoom = useContext(LightboxZoomRegistryContext)
  if (registerZoom === null) {
    throw new Error('This lightbox part must be rendered inside Lightbox.Root.')
  }
  return registerZoom
}
