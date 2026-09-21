'use client'

import {
  defaultUIEnvironment,
  type Brand,
  type Density,
  type DesignLanguage,
  type Mode,
  type PointerInput,
  type Surface,
  type Theme,
  type UIEnvironment,
} from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as React from 'react'

import { cn } from './lib/cn'

const UIEnvironmentContext = React.createContext<UIEnvironment>(defaultUIEnvironment)

export interface UIProviderProps extends useRender.ComponentProps<'div'>, Partial<UIEnvironment> {}

export function UIProvider({
  brand,
  className,
  density,
  designLanguage,
  input,
  mode,
  render,
  surface,
  theme,
  ...props
}: UIProviderProps): React.ReactElement {
  // Inherit un-passed dimensions from the nearest ancestor scope instead of
  // resetting them to defaults, so root/personalization theming (e.g. brand)
  // cascades through nested providers. A provider only stamps the data-a63-*
  // attributes for the dimensions explicitly set on it — the rest inherit via
  // the CSS cascade.
  const parent = React.useContext(UIEnvironmentContext)
  const environment = React.useMemo(
    () =>
      ({
        brand: brand ?? parent.brand,
        density: density ?? parent.density,
        designLanguage: designLanguage ?? parent.designLanguage,
        input: input ?? parent.input,
        mode: mode ?? parent.mode,
        surface: surface ?? parent.surface,
        theme: theme ?? parent.theme,
      }) satisfies UIEnvironment,
    [brand, density, designLanguage, input, mode, parent, surface, theme]
  )
  const resolvedMode = mode === 'system' ? 'light' : mode
  const defaultProps = {
    className: cn('a63-UIProvider', className),
    ...(brand !== undefined && { 'data-a63-brand': brand }),
    ...(density !== undefined && { 'data-a63-density': density }),
    ...(designLanguage !== undefined && { 'data-a63-design-language': designLanguage }),
    ...(input !== undefined && { 'data-a63-input': input }),
    ...(mode !== undefined && { 'data-a63-mode': resolvedMode }),
    ...(surface !== undefined && { 'data-a63-surface': surface }),
    ...(theme !== undefined && { 'data-a63-theme': theme }),
  }

  return (
    <UIEnvironmentContext.Provider value={environment}>
      {useRender({
        defaultTagName: 'div',
        props: mergeProps<'div'>(defaultProps, props),
        render,
      })}
    </UIEnvironmentContext.Provider>
  )
}

export function useUIEnvironment() {
  return React.useContext(UIEnvironmentContext)
}

export type { Brand, Density, DesignLanguage, Mode, PointerInput, Surface, Theme, UIEnvironment }
