import { resolveInform } from './arbiter'
import type { DismissalRecord, DismissalStore } from './persistence'
import { dismissalKey } from './registry'
import { EMPTY_INFORM_RESOLUTION } from './types'
import type { InformContext, InformRegistry, InformResolution } from './types'

export type InformStoreOptions = {
  registry: InformRegistry
  context: InformContext
  dismissals: DismissalStore
  isAnchorAvailable?: (anchor: string) => boolean
  /** Injectable clock so dismissal timestamps are deterministic in tests. */
  now?: () => number
}

export type InformStore = {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => InformResolution
  isReady: () => boolean
  /** Read persisted dismissals and begin resolving. Call from an effect, never during render. */
  hydrate: () => void
  setContext: (context: InformContext) => void
  dismiss: (id: string) => void
  /** Re-run arbitration, e.g. after a spotlight anchor mounts. */
  refresh: () => void
}

export function createInformStore(options: InformStoreOptions): InformStore {
  const now = options.now ?? (() => Date.now())
  const listeners = new Set<() => void>()

  let context = options.context
  let dismissals: DismissalRecord = {}
  let ready = false
  // Cached so getSnapshot is referentially stable; useSyncExternalStore loops
  // forever if the snapshot identity changes on every read.
  let snapshot: InformResolution = EMPTY_INFORM_RESOLUTION

  const emit = (): void => {
    for (const listener of listeners) listener()
  }

  const recompute = (): void => {
    snapshot = ready
      ? resolveInform({
          registry: options.registry,
          ctx: context,
          dismissals,
          isAnchorAvailable: options.isAnchorAvailable,
        })
      : EMPTY_INFORM_RESOLUTION
    emit()
  }

  return {
    subscribe: listener => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: () => snapshot,
    isReady: () => ready,
    hydrate: () => {
      dismissals = options.dismissals.read()
      ready = true
      recompute()
    },
    setContext: next => {
      context = next
      recompute()
    },
    dismiss: id => {
      const message = options.registry.messages.find(entry => entry.id === id)
      if (message === undefined) return

      const key = dismissalKey(message)
      const at = now()
      options.dismissals.write(key, message.dismiss, at)
      dismissals = { ...dismissals, [key]: at }
      recompute()
    },
    refresh: recompute,
  }
}
