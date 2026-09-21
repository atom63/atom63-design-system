'use client'

import { createContext, createElement, useContext, useState, type ReactNode } from 'react'

/**
 * Internal wiring between a thumbnail strip and each `Slide`: presence only,
 * not the strip's data. `Slide` reads whether a strip is registered to choose
 * between `role="tabpanel"` (labelled by that thumbnail) and a standalone
 * `role="group"` — exactly the branch `media-lightbox.tsx` took on its own
 * `showThumbnails` flag. Task 9's `Lightbox.Thumbnails` is the registrant.
 *
 * Do not re-export this module from the public parts barrel.
 */
const LightboxThumbnailsPresenceContext = createContext(false)
const LightboxThumbnailsRegistryContext = createContext<((present: boolean) => void) | null>(null)

export function LightboxThumbnailsRegistryProvider({ children }: { children: ReactNode }) {
  const [present, setPresent] = useState(false)
  return createElement(
    LightboxThumbnailsRegistryContext.Provider,
    { value: setPresent },
    createElement(LightboxThumbnailsPresenceContext.Provider, { value: present }, children)
  )
}

/** Read by `Slide` to pick its `role` and label. `false` when no strip is registered. */
export function useLightboxThumbnailsPresence(): boolean {
  return useContext(LightboxThumbnailsPresenceContext)
}

/** Called by the thumbnail strip to declare itself present or absent. */
export function useLightboxThumbnailsRegistry(): (present: boolean) => void {
  const register = useContext(LightboxThumbnailsRegistryContext)
  if (register === null) {
    throw new Error('This lightbox part must be rendered inside Lightbox.Root.')
  }
  return register
}
