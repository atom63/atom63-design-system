import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { CreateThemeProviderOptions, ThemeContextValue, ThemeMode } from '../core/types'

const DEFAULT_MODES = ['light', 'dark', 'system'] as const

function resolveIsDark(theme: ThemeMode): boolean {
  if (theme === 'dark') {
    return true
  }
  if (theme === 'light') {
    return false
  }
  if (typeof window === 'undefined') {
    return true
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyHtmlTheme(theme: ThemeMode) {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
    return
  }

  root.classList.add(theme)
}

function readStoredTheme(
  storageKey: string,
  defaultTheme: ThemeMode,
  modes: readonly ThemeMode[]
): ThemeMode {
  if (typeof window === 'undefined') {
    return defaultTheme
  }

  try {
    const stored = localStorage.getItem(storageKey) as ThemeMode | null
    if (stored && modes.includes(stored)) {
      return stored
    }
  } catch {
    // ignore
  }

  return defaultTheme
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (options: { update: () => void; types: string[] }) => {
    finished: Promise<void>
  }
}

export function createThemeProvider(options: CreateThemeProviderOptions) {
  const {
    storageKey,
    defaultTheme = 'dark',
    modes = DEFAULT_MODES,
    viewTransition = false,
  } = options

  const allowedModes = modes as readonly ThemeMode[]

  const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

  function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>(() =>
      readStoredTheme(storageKey, defaultTheme, allowedModes)
    )
    const [isDark, setIsDark] = useState(() => resolveIsDark(defaultTheme))
    const [isChanging, setIsChanging] = useState(false)

    useEffect(() => {
      applyHtmlTheme(theme)
      setIsDark(resolveIsDark(theme))
    }, [theme])

    useEffect(() => {
      if (theme !== 'system') {
        return
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        setIsDark(mediaQuery.matches)
        applyHtmlTheme('system')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    const disableTransitions = useCallback(() => {
      setIsChanging(true)
      window.setTimeout(() => {
        setIsChanging(false)
      }, 100)
    }, [])

    const persistTheme = useCallback((newTheme: ThemeMode) => {
      if (!allowedModes.includes(newTheme)) {
        return
      }

      setThemeState(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // ignore
      }
    }, [])

    const setTheme = useCallback(
      (newTheme: ThemeMode) => {
        if (!allowedModes.includes(newTheme) || newTheme === theme) {
          return
        }

        const switchTheme = () => {
          persistTheme(newTheme)
        }

        if (!viewTransition) {
          switchTheme()
          return
        }

        setIsChanging(true)

        const html = document.documentElement
        html.setAttribute('data-theme-transitioning', 'true')

        const cleanup = () => {
          html.removeAttribute('data-theme-transitioning')
          setIsChanging(false)
        }

        const doc = document as ViewTransitionDocument

        if (doc.startViewTransition) {
          const transition = doc.startViewTransition({
            update: switchTheme,
            types: ['theme'],
          })
          // Run cleanup whether the transition finishes or is skipped/aborted —
          // passing cleanup as the rejection handler means nothing is swallowed.
          void transition.finished.then(cleanup, cleanup)
        } else {
          switchTheme()
          window.setTimeout(cleanup, 100)
        }
      },
      [persistTheme, theme]
    )

    const toggleTheme = useCallback(() => {
      setTheme(isDark ? 'light' : 'dark')
    }, [isDark, setTheme])

    const value = useMemo<ThemeContextValue>(
      () => ({
        theme,
        setTheme,
        toggleTheme,
        toggle: toggleTheme,
        isDark,
        isLight: !isDark,
        isSystem: theme === 'system',
        isChanging,
        disableTransitions,
      }),
      [theme, setTheme, toggleTheme, isDark, isChanging, disableTransitions]
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  }

  function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext)
    if (context === undefined) {
      throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
  }

  return { ThemeProvider, useTheme }
}
