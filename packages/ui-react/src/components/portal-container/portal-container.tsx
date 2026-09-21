'use client'

import * as React from 'react'

/*
 * PortalContainer — a tiny context that carries the DOM node (or ShadowRoot)
 * that portalled overlays (popovers, tooltips, dialogs) should render into.
 * Faithful port of prod @atom63/ui portal-container.tsx: same API
 * (PortalContainerProvider + usePortalContainer) and the same
 * HTMLElement | ShadowRoot | null | undefined value type. Purely behavioral —
 * no chrome, so there is no recipe CSS.
 */

export type PortalContainer = HTMLElement | ShadowRoot | null | undefined

const PortalContainerContext = React.createContext<PortalContainer>(undefined)

export interface PortalContainerProviderProps {
  children: React.ReactNode
  container: PortalContainer
}

function PortalContainerProvider({
  children,
  container,
}: PortalContainerProviderProps): React.ReactElement {
  return (
    <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>
  )
}

function usePortalContainer(): PortalContainer {
  return React.useContext(PortalContainerContext)
}

export { PortalContainerProvider, usePortalContainer }
