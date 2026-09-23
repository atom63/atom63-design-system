import {
  AppearanceMenu,
  type AppearanceSectionId,
  type PersonalizationController,
  type PersonalizationState,
  applyPersonalization,
} from '@atom63/ui-react/theme'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../theme'

const STORAGE_KEY = 'ds-appearance'

/** The docs surface exposes these axes; mode comes from the theme-context. */
const DS_SECTIONS: readonly AppearanceSectionId[] = [
  'mode',
  'theme',
  'brand',
  'surface',
  'surfaceTint',
  'typeScale',
  'radius',
]

/** Non-mode personalization axes owned locally (mode lives in theme-context). */
type StoredAppearance = Omit<PersonalizationState, 'mode'>

const DEFAULT_APPEARANCE: StoredAppearance = {
  theme: 'modern',
  brand: 'b1',
  surface: 'n1',
  surfaceTint: 0,
  typeScale: 'normal',
  radius: 'default',
  font: 'sans',
  os: 'macos',
  iconTheme: 'color',
  wallpaper: null,
}

function readStoredAppearance(): StoredAppearance {
  if (typeof window === 'undefined') {
    return DEFAULT_APPEARANCE
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return DEFAULT_APPEARANCE
    }
    return { ...DEFAULT_APPEARANCE, ...JSON.parse(stored) } as StoredAppearance
  } catch {
    return DEFAULT_APPEARANCE
  }
}

export function DesignSystemAppearanceMenu() {
  const { setTheme, theme: mode } = useTheme()
  const [appearance, setAppearance] = useState(readStoredAppearance)

  const state = useMemo<PersonalizationState>(() => ({ ...appearance, mode }), [appearance, mode])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance))
    } catch {
      // Ignore persistence failures.
    }
    applyPersonalization(state)
  }, [appearance, state, mode])

  const patch = useCallback((next: Partial<StoredAppearance>) => {
    setAppearance(current => ({ ...current, ...next }))
  }, [])

  const controller = useMemo<PersonalizationController>(
    () => ({
      state,
      setMode: nextMode => setTheme(nextMode),
      setTheme: nextTheme => patch({ theme: nextTheme }),
      setBrand: brand => patch({ brand }),
      setSurface: surface => patch({ surface }),
      setSurfaceTint: surfaceTint => patch({ surfaceTint }),
      setTypeScale: typeScale => patch({ typeScale }),
      setRadius: radius => patch({ radius }),
      setFont: font => patch({ font }),
      setOs: os => patch({ os }),
      setIconTheme: iconTheme => patch({ iconTheme }),
      setWallpaper: wallpaper => patch({ wallpaper }),
      update: partial => {
        const { mode: nextMode, ...rest } = partial
        if (nextMode !== undefined) {
          setTheme(nextMode)
        }
        patch(rest)
      },
      reset: () => setAppearance(DEFAULT_APPEARANCE),
    }),
    [patch, setTheme, state]
  )

  return (
    <AppearanceMenu
      controller={controller}
      description="Adjust the docs surface, accent, type, and density."
      sections={DS_SECTIONS}
      showTrigger={false}
      title="Appearance"
    />
  )
}
