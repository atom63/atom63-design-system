'use client'

import { defaultUIEnvironment, type Mode, type Theme } from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as React from 'react'

import { cn } from './lib/cn'

export type Atom63ThemeMode = Exclude<Mode, 'system'>

export interface Atom63ThemeProps extends useRender.ComponentProps<'div'> {
  mode?: Atom63ThemeMode
  theme?: Theme
}

function withoutModeClasses(className: string | undefined): string | undefined {
  return className
    ?.split(/\s+/)
    .filter(name => name && name !== 'light' && name !== 'dark')
    .join(' ')
}

export function Atom63Theme({
  className,
  mode = 'light',
  render,
  theme = defaultUIEnvironment.theme,
  ...props
}: Atom63ThemeProps): React.ReactElement {
  const themeProps = {
    className: cn('a63-Atom63Theme', withoutModeClasses(className), mode),
    'data-a63-mode': mode,
    'data-a63-theme': theme,
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(props, themeProps),
    render,
  })
}
