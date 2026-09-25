import { createContext, useEffect, useMemo, useRef } from 'react'
import type { ReactElement, ReactNode } from 'react'

import { createWebDismissalStore } from '../core/persistence'
import type { DismissalStore } from '../core/persistence'
import { createInformStore } from '../core/store'
import type { InformStore } from '../core/store'
import type { InformContext, InformRegistry } from '../core/types'

export const InformStoreContext = createContext<InformStore | null>(null)

/**
 * The context the provider was given. Published separately from the store so
 * outlets can resolve function-valued content without reading the store's
 * mutable context during render.
 */
export const InformContextValue = createContext<InformContext | null>(null)

export type InformProviderProps = {
  registry: InformRegistry
  context: InformContext
  dismissals?: DismissalStore
  isAnchorAvailable?: (anchor: string) => boolean
  children: ReactNode
}

function defaultIsAnchorAvailable(anchor: string): boolean {
  if (typeof document === 'undefined') return false
  return document.querySelector(anchor) !== null
}

export function InformProvider({
  children,
  context,
  dismissals,
  isAnchorAvailable = defaultIsAnchorAvailable,
  registry,
}: InformProviderProps): ReactElement {
  // The store is long-lived: rebuilding it on a context change would discard
  // hydration state, so the current context is pushed in through setContext.
  const latest = useRef({ context, dismissals, isAnchorAvailable })
  latest.current = { context, dismissals, isAnchorAvailable }

  const store = useMemo(
    () =>
      createInformStore({
        registry,
        context: latest.current.context,
        dismissals: latest.current.dismissals ?? createWebDismissalStore(),
        isAnchorAvailable: anchor => latest.current.isAnchorAvailable(anchor),
      }),
    [registry]
  )

  // Storage is read after mount, never during render: reading it inline would
  // paint a message for one frame and then yank it away.
  useEffect(() => {
    store.hydrate()
  }, [store])

  useEffect(() => {
    store.setContext(context)
  }, [store, context])

  return (
    <InformStoreContext.Provider value={store}>
      <InformContextValue.Provider value={context}>{children}</InformContextValue.Provider>
    </InformStoreContext.Provider>
  )
}
