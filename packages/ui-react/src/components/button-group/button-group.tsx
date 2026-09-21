'use client'

import {
  type ButtonGroupOrientation,
  type ButtonGroupSize,
  buttonGroupContract,
} from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { Separator } from '../separator'
import { ButtonGroupProvider } from './button-group-context'

export type ButtonGroupProps = React.ComponentProps<'div'> & {
  orientation?: ButtonGroupOrientation
  size?: ButtonGroupSize
}

/* ButtonGroup — welds a run of controls (Button / Input / Select / text) into a
   joined segmented bar. Shares ToggleGroup's --a63-segment-* cell chrome
   (resting gel, selected pressed plate). Orientation + size drive the recipe;
   member controls flatten elevation via group CSS + ButtonGroup context. */
export function ButtonGroup({
  className,
  orientation = buttonGroupContract.defaultOrientation,
  size = buttonGroupContract.defaultSize,
  ...props
}: ButtonGroupProps): React.ReactElement {
  return (
    <ButtonGroupProvider>
      <div
        className={cn('a63-ButtonGroup', className)}
        data-orientation={orientation}
        data-size={size}
        data-slot="button-group"
        role="group"
        {...props}
      />
    </ButtonGroupProvider>
  )
}

/* A non-interactive text/label cell inside the group (e.g. a leading prefix). */
export function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>({ className: cn('a63-ButtonGroup-text', className) }, props, {
      'data-slot': 'button-group-text',
    } as React.ComponentProps<'div'>),
    render,
    state: {
      slot: 'button-group-text',
    },
  })
}

export type ButtonGroupSeparatorProps = React.ComponentProps<typeof Separator>

/* A hairline that divides item runs within the group. */
export function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: ButtonGroupSeparatorProps): React.ReactElement {
  return (
    <Separator
      className={cn('a63-ButtonGroup-separator', className)}
      data-slot="button-group-separator"
      orientation={orientation}
      {...props}
    />
  )
}
