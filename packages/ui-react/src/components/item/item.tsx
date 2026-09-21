'use client'

import {
  type ItemMediaVariant,
  type ItemSize,
  type ItemVariant,
  itemContract,
} from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { Separator } from '../separator'

/* Item — a flexible list/row primitive (media · content · actions). Faithful to
   prod @atom63/ui: an Item container (variant + size) composing ItemMedia,
   ItemContent (Title/Description), ItemActions, plus Header/Footer bands, and an
   ItemGroup/ItemSeparator for lists. `render` swaps the container element (e.g.
   an <a> for a clickable row). Chrome from --a63-* tokens. */

export function ItemGroup({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-ItemGroup', className)} data-slot="item-group" {...props} />
}

export type ItemSeparatorProps = React.ComponentProps<typeof Separator>

export function ItemSeparator({ className, ...props }: ItemSeparatorProps): React.ReactElement {
  return (
    <Separator
      className={cn('a63-ItemSeparator', className)}
      data-slot="item-separator"
      orientation="horizontal"
      {...props}
    />
  )
}

export type ItemProps = useRender.ComponentProps<'div'> & {
  variant?: ItemVariant
  size?: ItemSize
}

export function Item({
  className,
  variant = itemContract.defaultVariant,
  size = itemContract.defaultSize,
  render,
  ...props
}: ItemProps): React.ReactElement {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn('a63-Item', className),
        'data-size': size,
        'data-slot': 'item',
        'data-variant': variant,
      } as React.ComponentProps<'div'>,
      props
    ),
    render,
    state: {
      size,
      slot: 'item',
      variant,
    },
  })
}

export type ItemMediaProps = React.ComponentProps<'div'> & {
  variant?: ItemMediaVariant
}

export function ItemMedia({
  className,
  variant = itemContract.defaultMediaVariant,
  ...props
}: ItemMediaProps): React.ReactElement {
  return (
    <div
      className={cn('a63-ItemMedia', className)}
      data-slot="item-media"
      data-variant={variant}
      {...props}
    />
  )
}

export function ItemContent({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-ItemContent', className)} data-slot="item-content" {...props} />
}

export function ItemTitle({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-ItemTitle', className)} data-slot="item-title" {...props} />
}

export function ItemDescription({
  className,
  ...props
}: React.ComponentProps<'p'>): React.ReactElement {
  return (
    <p className={cn('a63-ItemDescription', className)} data-slot="item-description" {...props} />
  )
}

export function ItemActions({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-ItemActions', className)} data-slot="item-actions" {...props} />
}

export function ItemHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-ItemHeader', className)} data-slot="item-header" {...props} />
}

export function ItemFooter({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-ItemFooter', className)} data-slot="item-footer" {...props} />
}
