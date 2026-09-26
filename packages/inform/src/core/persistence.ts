import type { InformDismissMode } from './types'

export const INFORM_DISMISSAL_STORAGE_KEY = 'a63.inform.dismissed'

/** Persistence key (`id:version`) to dismissal timestamp in epoch milliseconds. */
export type DismissalRecord = Record<string, number>

export interface DismissalStore {
  read(): DismissalRecord
  write(key: string, mode: InformDismissMode, at: number): void
  clear(key?: string): void
}

export function createMemoryDismissalStore(seed: DismissalRecord = {}): DismissalStore {
  let record: DismissalRecord = { ...seed }

  return {
    read: () => ({ ...record }),
    write: (key, mode, at) => {
      if (mode === 'none') return
      record = { ...record, [key]: at }
    },
    clear: key => {
      if (key === undefined) {
        record = {}
        return
      }
      const { [key]: _removed, ...rest } = record
      record = rest
    },
  }
}

export type StorageScope = {
  localStorage: Storage
  sessionStorage: Storage
}

function readStorage(storage: Storage): DismissalRecord {
  try {
    const raw = storage.getItem(INFORM_DISMISSAL_STORAGE_KEY)
    if (raw === null) return {}

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}

    const record: DismissalRecord = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'number' && Number.isFinite(value)) record[key] = value
    }
    return record
  } catch {
    // Corrupt or unavailable storage must degrade to "nothing dismissed",
    // never break the page that mounted the provider.
    return {}
  }
}

function writeStorage(storage: Storage, next: DismissalRecord): void {
  try {
    storage.setItem(INFORM_DISMISSAL_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private-mode and quota failures are not worth surfacing to the visitor.
  }
}

function resolveScope(scope: StorageScope | undefined): StorageScope | undefined {
  if (scope !== undefined) return scope
  if (typeof window === 'undefined') return undefined

  return { localStorage: window.localStorage, sessionStorage: window.sessionStorage }
}

export function createWebDismissalStore(scope?: StorageScope): DismissalStore {
  const resolved = resolveScope(scope)
  if (resolved === undefined) return createMemoryDismissalStore()

  const storageFor = (mode: InformDismissMode): Storage | undefined => {
    if (mode === 'persistent') return resolved.localStorage
    if (mode === 'session') return resolved.sessionStorage
    return undefined
  }

  return {
    read: () => ({
      ...readStorage(resolved.localStorage),
      ...readStorage(resolved.sessionStorage),
    }),
    write: (key, mode, at) => {
      const storage = storageFor(mode)
      if (storage === undefined) return
      writeStorage(storage, { ...readStorage(storage), [key]: at })
    },
    clear: key => {
      for (const storage of [resolved.localStorage, resolved.sessionStorage]) {
        if (key === undefined) {
          writeStorage(storage, {})
          continue
        }
        const { [key]: _removed, ...rest } = readStorage(storage)
        writeStorage(storage, rest)
      }
    },
  }
}
