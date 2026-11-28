'use client'

import { defaultUIEnvironment, type Mode, type Theme } from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as React from 'react'

import { cn } from './lib/cn'

export type Atom63ThemeMode = Exclude<Mode, 'system'>

/** The form factor a scope is sized for: `phone` opts into phone type and controls. */
export type FormFactor = 'phone' | 'default'

export interface Atom63ThemeProps extends useRender.ComponentProps<'div'> {
  mode?: Atom63ThemeMode
  theme?: Theme
  /**
   * `phone` stamps `data-a63-form-factor="phone"`: the subtree takes a phone's type steps
   * (body 17, subheadline 15) and control sizing, without AppView's layout or scrolling.
   * Portaled overlays (Dialog, Drawer, Toaster) render outside this element, so a phone-only
   * app sets the same attribute on `<html>` too. Viewport width never applies it.
   */
  formFactor?: FormFactor
}

function withoutModeClasses(className: string | undefined): string | undefined {
  return className
    ?.split(/\s+/)
    .filter(name => name && name !== 'light' && name !== 'dark')
    .join(' ')
}

export function Atom63Theme({
  className,
  formFactor,
  mode = 'light',
  render,
  theme = defaultUIEnvironment.theme,
  ...props
}: Atom63ThemeProps): React.ReactElement {
  const themeProps = {
    className: cn('a63-Atom63Theme', withoutModeClasses(className), mode),
    'data-a63-mode': mode,
    'data-a63-theme': theme,
    ...(formFactor !== undefined && { 'data-a63-form-factor': formFactor }),
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(props, themeProps),
    render,
  })
}
