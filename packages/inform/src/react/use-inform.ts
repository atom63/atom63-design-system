import { useCallback, useContext, useSyncExternalStore } from 'react'

import type { InformContext, InformResolution } from '../core/types'
import { InformContextValue, InformStoreContext } from './inform-provider'

export type UseInformResult = {
  resolution: InformResolution
  ready: boolean
  dismiss: (id: string) => void
}

export function useInform(): UseInformResult {
  const store = useContext(InformStoreContext)
  if (store === null) {
    throw new Error('useInform must be used inside an <InformProvider>.')
  }

  const resolution = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const dismiss = useCallback(
    (id: string) => {
      store.dismiss(id)
    },
    [store]
  )

  return { resolution, ready: store.isReady(), dismiss }
}

/**
 * The context the nearest provider was given. Safe to read during render: it is
 * a plain React context value, not the store's mutable internal context.
 */
export function useInformContext(): InformContext {
  const context = useContext(InformContextValue)
  if (context === null) {
    throw new Error('useInformContext must be used inside an <InformProvider>.')
  }
  return context
}
