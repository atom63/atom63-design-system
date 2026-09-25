import { type Theme, themes } from '@atom63/ui-foundation'
import { Atom63Theme, type Atom63ThemeMode, SegmentedControl } from '@atom63/ui-react'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

type ThemeState = {
  mode: Atom63ThemeMode
  setMode: (mode: Atom63ThemeMode) => void
  setTheme: (theme: Theme) => void
  theme: Theme
}

const ThemeContext = createContext<ThemeState | null>(null)
const storageKey = 'atom63-appearance'

function readStored(): { mode?: Atom63ThemeMode; theme?: Theme } {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}')
  } catch {
    return {}
  }
}

function systemMode(): Atom63ThemeMode {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Mode and theme for the whole app. Atom63Theme sets the attributes every
 * token reads, so components never branch on light or dark themselves.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Atom63ThemeMode>(() => readStored().mode ?? systemMode())
  const [theme, setTheme] = useState<Theme>(() => readStored().theme ?? 'modern')

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ mode, theme }))
    } catch {
      // Private windows can refuse storage; the choice then lasts for the visit.
    }
  }, [mode, theme])

  return (
    <ThemeContext.Provider value={{ mode, setMode, setTheme, theme }}>
      <Atom63Theme className="bg-background text-foreground min-h-screen" mode={mode} theme={theme}>
        {children}
      </Atom63Theme>
    </ThemeContext.Provider>
  )
}

export function useAppearance(): ThemeState {
  const state = useContext(ThemeContext)
  if (!state) {
    throw new Error('useAppearance must be used inside ThemeProvider')
  }
  return state
}

const themeLabels: Record<Theme, string> = {
  aqua: 'Aqua',
  modern: 'Modern',
  retro: 'Retro',
  terminal: 'Terminal',
}

/** The mode and theme switches, so every axis is visible from the first run. */
export function AppearanceControls() {
  const { mode, setMode, setTheme, theme } = useAppearance()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        items={themes.map(value => ({ label: themeLabels[value], value }))}
        onValueChange={value => setTheme(value as Theme)}
        size="sm"
        value={theme}
      />
      <SegmentedControl
        items={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
        onValueChange={value => setMode(value as Atom63ThemeMode)}
        size="sm"
        value={mode}
      />
    </div>
  )
}
