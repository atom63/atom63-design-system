import type { Density } from '@atom63/ui-react'
import {
  applyPersonalization,
  BRAND_OPTIONS,
  OS_OPTIONS,
  RADIUS_OPTIONS,
  SURFACE_OPTIONS,
  THEME_OPTIONS,
  TYPE_SCALE_OPTIONS,
} from '@atom63/ui-react/theme'
import type { Decorator, Preview } from '@storybook/react-vite'
import { useEffect, type ReactNode } from 'react'

import './storybook.css'

type Option<T extends string> = { readonly id: T; readonly name: string }

function toolbarItems<T extends string>(options: readonly Option<T>[]) {
  return options.map(option => ({ title: option.name, value: option.id }))
}

/** Returns `value` when it is one of the option ids, otherwise `fallback`. */
function pick<T extends string>(options: readonly Option<T>[], value: unknown, fallback: T): T {
  return options.some(option => option.id === value) ? (value as T) : fallback
}

const MODE_OPTIONS = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
] as const
const DENSITY_OPTIONS = [
  { id: 'comfortable', name: 'Comfortable' },
  { id: 'compact', name: 'Compact' },
] as const satisfies readonly Option<Density>[]
const TINT_OPTIONS = ['0', '12', '24', '35', '100'].map(id => ({ id, name: `Tint ${id}` }))

interface Axes {
  mode: (typeof MODE_OPTIONS)[number]['id']
  theme: (typeof THEME_OPTIONS)[number]['id']
  brand: (typeof BRAND_OPTIONS)[number]['id']
  surface: (typeof SURFACE_OPTIONS)[number]['id']
  surfaceTint: number
  radius: (typeof RADIUS_OPTIONS)[number]['id']
  typeScale: (typeof TYPE_SCALE_OPTIONS)[number]['id']
  os: (typeof OS_OPTIONS)[number]['id']
  density: Density
}

/**
 * Applies the personalization axes to <html>, the way an app does at runtime.
 * Density and type scale must land on the root: control heights resolve there
 * from `--a63-space-unit`, so stamping them on a wrapper would only half-apply
 * the axis.
 */
function PersonalizationShell({ axes, children }: { axes: Axes; children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-a63-density', axes.density)
    applyPersonalization({
      mode: axes.mode,
      theme: axes.theme,
      brand: axes.brand,
      surface: axes.surface,
      surfaceTint: axes.surfaceTint,
      typeScale: axes.typeScale,
      radius: axes.radius,
      font: 'sans',
      os: axes.os,
      iconTheme: 'color',
      wallpaper: null,
    })
  }, [axes])

  return children
}

const withPersonalization: Decorator = (Story, { globals }) => {
  const axes: Axes = {
    mode: pick(MODE_OPTIONS, globals.mode, 'light'),
    theme: pick(THEME_OPTIONS, globals.theme, 'modern'),
    brand: pick(BRAND_OPTIONS, globals.brand, BRAND_OPTIONS[0].id),
    surface: pick(SURFACE_OPTIONS, globals.surface, SURFACE_OPTIONS[0].id),
    surfaceTint: Number(pick(TINT_OPTIONS, globals.surfaceTint, '0')),
    radius: pick(RADIUS_OPTIONS, globals.radius, 'default'),
    typeScale: pick(TYPE_SCALE_OPTIONS, globals.typeScale, 'normal'),
    os: pick(OS_OPTIONS, globals.os, 'macos'),
    density: pick(DENSITY_OPTIONS, globals.density, 'comfortable'),
  }

  return (
    <PersonalizationShell axes={axes}>
      <Story />
    </PersonalizationShell>
  )
}

function toolbar<T extends string>(
  title: string,
  icon: string,
  options: readonly Option<T>[],
  defaultValue: T
) {
  return {
    defaultValue,
    toolbar: { title, icon, items: toolbarItems(options), dynamicTitle: true },
  }
}

const preview: Preview = {
  globalTypes: {
    mode: toolbar('Mode', 'mirror', MODE_OPTIONS, 'light'),
    theme: toolbar('Theme', 'paintbrush', THEME_OPTIONS, 'modern'),
    brand: toolbar('Brand', 'circle', BRAND_OPTIONS, BRAND_OPTIONS[0].id),
    surface: toolbar('Surface', 'contrast', SURFACE_OPTIONS, SURFACE_OPTIONS[0].id),
    surfaceTint: toolbar('Tint', 'paintbrush', TINT_OPTIONS, '0'),
    radius: toolbar('Radius', 'circlehollow', RADIUS_OPTIONS, 'default'),
    typeScale: toolbar('Type scale', 'typography', TYPE_SCALE_OPTIONS, 'normal'),
    density: toolbar('Density', 'component', DENSITY_OPTIONS, 'comfortable'),
    os: toolbar('System', 'browser', OS_OPTIONS, 'macos'),
  },
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    backgrounds: { disable: true },
    options: { storySort: { method: 'alphabetical' } },
  },
  decorators: [withPersonalization],
}

export default preview
