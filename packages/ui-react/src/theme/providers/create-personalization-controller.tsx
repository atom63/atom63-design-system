import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { applyPersonalization } from '../core/apply-personalization'
import {
  AUTO_FALLBACK_COLOR,
  applyAutoColorRamp,
  clearAutoColorRamp,
  extractDominantColor,
} from '../core/auto-primary'
import type {
  BrandId,
  ColorMode,
  FontFamily,
  IconTheme,
  OsSystem,
  PersonalizationController,
  PersonalizationState,
  RadiusScale,
  SurfaceId,
  ThemeId,
  TypeScale,
} from '../core/types'

interface CreatePersonalizationControllerOptions {
  storageKey: string
  defaultState: PersonalizationState
  /**
   * Resolve the active wallpaper to an image URL for the `auto` brand's color
   * extraction. Injected by the consumer so the DS ships no wallpaper assets.
   */
  resolveWallpaperSrc?: (wallpaper: string | null, isDark: boolean) => string | null | undefined
}

function readStoredState(
  storageKey: string,
  defaultState: PersonalizationState
): PersonalizationState {
  if (typeof window === 'undefined') {
    return defaultState
  }
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) {
      return defaultState
    }
    return { ...defaultState, ...JSON.parse(stored) }
  } catch {
    return defaultState
  }
}

export function createPersonalizationController({
  storageKey,
  defaultState,
  resolveWallpaperSrc,
}: CreatePersonalizationControllerOptions) {
  const Context = createContext<PersonalizationController | undefined>(undefined)

  function PersonalizationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState(() => readStoredState(storageKey, defaultState))
    const autoGeneration = useRef(0)

    // Persist + apply attributes on every change.
    useEffect(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state))
      } catch {
        // ignore persistence failures
      }
      applyPersonalization(state)
    }, [state])

    // Auto brand: derive --color-auto-* from the active wallpaper, else clear.
    // Guarded by a generation counter so a slow extraction can't clobber a newer
    // one. All-or-nothing: on any failure we fall back to the synthetic ramp.
    // NOTE: reads the `dark` class written by the persist+apply effect above —
    // keep that effect declared FIRST so the class is synced before this runs.
    useEffect(() => {
      const root = document.documentElement
      if (state.brand !== 'auto') {
        clearAutoColorRamp(root)
        return
      }
      const generation = ++autoGeneration.current
      const isDark = root.classList.contains('dark')
      const src = resolveWallpaperSrc?.(state.wallpaper, isDark)
      if (!src) {
        applyAutoColorRamp(root, AUTO_FALLBACK_COLOR)
        return
      }
      void extractDominantColor(src).then(color => {
        if (generation !== autoGeneration.current) {
          return
        }
        applyAutoColorRamp(root, color ?? AUTO_FALLBACK_COLOR)
      })
    }, [state.brand, state.wallpaper])

    // Re-apply when the OS color scheme changes while in system mode.
    useEffect(() => {
      if (state.mode !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
        return
      }
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => applyPersonalization(state)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }, [state])

    const update = useCallback((partial: Partial<PersonalizationState>) => {
      setState(current => ({ ...current, ...partial }))
    }, [])

    const reset = useCallback(() => setState(defaultState), [])

    const value = useMemo<PersonalizationController>(
      () => ({
        state,
        update,
        reset,
        setMode: (mode: ColorMode) => update({ mode }),
        setTheme: (theme: ThemeId) => update({ theme }),
        setBrand: (brand: BrandId) => update({ brand }),
        setSurface: (surface: SurfaceId) => update({ surface }),
        setSurfaceTint: (surfaceTint: number) => update({ surfaceTint }),
        setTypeScale: (typeScale: TypeScale) => update({ typeScale }),
        setRadius: (radius: RadiusScale) => update({ radius }),
        setFont: (font: FontFamily) => update({ font }),
        setOs: (os: OsSystem) => update({ os }),
        setIconTheme: (iconTheme: IconTheme) => update({ iconTheme }),
        setWallpaper: (wallpaper: string | null) => update({ wallpaper }),
      }),
      [state, update, reset]
    )

    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  function usePersonalization(): PersonalizationController {
    const context = useContext(Context)
    if (!context) {
      throw new Error('usePersonalization must be used within PersonalizationProvider')
    }
    return context
  }

  return { PersonalizationProvider, usePersonalization }
}
