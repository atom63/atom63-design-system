import type { Atom63ThemeMode } from '@atom63/ui-react'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'

/*
 * Tidepool's look: the Modern theme with the violet brand ramp (b5), set on
 * <html> in index.html so dialogs and sheets, which render into <body>, get the
 * same tokens. The mode follows the system until someone picks one here.
 */
export type ModePreference = 'system' | Atom63ThemeMode

type Appearance = {
  preference: ModePreference
  setPreference: (preference: ModePreference) => void
}

const AppearanceContext = createContext<Appearance | null>(null)
const storageKey = 'tidepool-mode'
const darkQuery = '(prefers-color-scheme: dark)'

function readStored(): ModePreference {
  try {
    const value = localStorage.getItem(storageKey)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

function resolve(preference: ModePreference): Atom63ThemeMode {
  if (preference !== 'system') return preference
  return window.matchMedia?.(darkQuery).matches ? 'dark' : 'light'
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ModePreference>(readStored)
  const [mode, setMode] = useState<Atom63ThemeMode>(() => resolve(preference))

  useEffect(() => {
    setMode(resolve(preference))
    try {
      if (preference === 'system') localStorage.removeItem(storageKey)
      else localStorage.setItem(storageKey, preference)
    } catch {
      // Private windows can refuse storage; the choice then lasts for the visit.
    }
    if (preference !== 'system') return
    const query = window.matchMedia(darkQuery)
    const follow = () => setMode(resolve('system'))
    query.addEventListener('change', follow)
    return () => query.removeEventListener('change', follow)
  }, [preference])

  // The mode attribute and class drive every --a63-* token and the `dark:` variant.
  useLayoutEffect(() => {
    const html = document.documentElement
    html.dataset.a63Mode = mode
    html.classList.toggle('dark', mode === 'dark')
    html.classList.toggle('light', mode === 'light')
  }, [mode])

  return (
    <AppearanceContext.Provider value={{ preference, setPreference }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance(): Appearance {
  const value = useContext(AppearanceContext)
  if (!value) throw new Error('useAppearance must be used inside AppearanceProvider')
  return value
}
