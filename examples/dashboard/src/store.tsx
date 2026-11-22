import { useSearch } from '@tanstack/react-router'
import { createContext, type ReactNode, useContext, useState } from 'react'

import { type Account, sampleAccounts } from './data'

/*
 * The accounts live in memory for the visit: creating or editing one changes
 * this list, and a reload starts again from the sample. A real app swaps this
 * provider for its data layer.
 */
type AccountStore = {
  accounts: readonly Account[]
  save: (account: Account) => void
}

const AccountsContext = createContext<AccountStore | null>(null)

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<readonly Account[]>(sampleAccounts)
  const save = (account: Account) =>
    setAccounts(current =>
      current.some(item => item.id === account.id)
        ? current.map(item => (item.id === account.id ? account : item))
        : [account, ...current]
    )
  return <AccountsContext.Provider value={{ accounts, save }}>{children}</AccountsContext.Provider>
}

export function useAccounts(): AccountStore {
  const value = useContext(AccountsContext)
  if (!value) throw new Error('useAccounts must be used inside AccountsProvider')
  return value
}

/*
 * Which state the data pages show. `?state=loading`, `?state=empty` and
 * `?state=error` force one, so each can be reviewed and tested; without the
 * parameter the pages show the sample data.
 */
export type DataState = 'ready' | 'loading' | 'empty' | 'error'
export const dataStates = ['ready', 'loading', 'empty', 'error'] as const

export function parseDataState(value: unknown): DataState | undefined {
  return value === 'loading' || value === 'empty' || value === 'error' ? value : undefined
}

export function useDataState(): DataState {
  const search = useSearch({ strict: false }) as { state?: DataState }
  return search.state ?? 'ready'
}
