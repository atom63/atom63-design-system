'use client'

import {
  type ItemGroupSurface,
  type ItemGroupVariant,
  type ItemMediaAspect,
  type ItemMediaVariant,
  type ItemSize,
  type ItemSizeAlias,
  type ItemTone,
  type ItemVariant,
  itemContract,
} from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { createContext, useContext } from 'react'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { Separator } from '../separator'

/* Item — a flexible list/row primitive (media · content · actions). Faithful to
   prod @atom63/ui: an Item container (variant + size) composing ItemMedia,
   ItemContent (Title/Description), ItemActions, plus Header/Footer bands, and an
   ItemGroup/ItemSeparator for lists. `render` swaps the container element (e.g.
   an <a> for a clickable row). Chrome from --a63-* tokens. */

/* Rows inside an ItemGroup are its list items. */
const ItemGroupContext = createContext(false)

/** A list of rows: `role="list"`, and each Item in it is a list item. */
export type ItemGroupProps = React.ComponentProps<'div'> & {
  /** `inset` draws the group as a rounded card with hairline dividers (a grouped settings list). */
  variant?: ItemGroupVariant
  /**
   * The fill of an `inset` group. `card` (the default) is the panel fill, for a grey page
   * (`bg-background`); `muted` is the grey fill, for a white page (`bg-card`).
   */
  surface?: ItemGroupSurface
}

export function ItemGroup({
  className,
  variant = itemContract.defaultGroupVariant,
  surface = itemContract.defaultGroupSurface,
  ...props
}: ItemGroupProps): React.ReactElement {
  return (
    <ItemGroupContext.Provider value>
      <div
        className={cn('a63-ItemGroup', className)}
        data-slot="item-group"
        data-surface={surface}
        data-variant={variant}
        role="list"
        {...props}
      />
    </ItemGroupContext.Provider>
  )
}

export type ItemSeparatorProps = React.ComponentProps<typeof Separator>

export function ItemSeparator({ className, ...props }: ItemSeparatorProps): React.ReactElement {
  // Inside a list the divider is drawing only: a list owns list items, not separators.
  const inGroup = useContext(ItemGroupContext)
  return (
    <Separator
      aria-hidden={inGroup || undefined}
      className={cn('a63-ItemSeparator', className)}
      data-slot="item-separator"
      orientation="horizontal"
      {...props}
    />
  )
}

export type ItemProps = useRender.ComponentProps<'div'> & {
  variant?: ItemVariant
  /** `'default'` is a deprecated alias of `'md'`. */
  size?: ItemSize | ItemSizeAlias
  /**
   * How a selected or current row (`aria-current`, `data-selected`) is coloured.
   * `neutral` (the default) is a muted fill with primary text; `accent` is a light
   * primary wash with accent text.
   */
  tone?: ItemTone
}

export function Item({
  className,
  variant = itemContract.defaultVariant,
  size: sizeProp = itemContract.defaultSize,
  tone = itemContract.defaultTone,
  render,
  ...props
}: ItemProps): React.ReactElement {
  const size = sizeProp === 'default' ? 'md' : sizeProp
  const inGroup = useContext(ItemGroupContext)
  const element = useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn('a63-Item', className),
        role: inGroup && !render ? 'listitem' : undefined,
        'data-size': size,
        'data-slot': 'item',
        'data-tone': tone,
        'data-variant': variant,
      } as React.ComponentProps<'div'>,
      props
    ),
    render,
    state: {
      size,
      slot: 'item',
      tone,
      variant,
    },
  })
  // A rendered link or button keeps its own role, so a list item wraps it.
  if (inGroup && render) {
    return (
      <div className="a63-ItemGroup-entry" data-slot="item-entry" role="listitem">
        {element}
      </div>
    )
  }
  return element
}

export type ItemMediaProps = React.ComponentProps<'div'> & {
  variant?: ItemMediaVariant
  /**
   * The shape of an `image` media. `square` (the default); `portrait` is 3:4, for a cover or
   * poster (one size step taller than a square, so 48×36 in an `md` row); `landscape` is 4:3,
   * at the square's height. The width follows the height.
   */
  aspect?: ItemMediaAspect
}

export function ItemMedia({
  className,
  variant = itemContract.defaultMediaVariant,
  aspect = itemContract.defaultMediaAspect,
  ...props
}: ItemMediaProps): React.ReactElement {
  return (
    <div
      className={cn('a63-ItemMedia', className)}
      data-aspect={variant === 'image' ? aspect : undefined}
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

export type ItemTitleProps = useRender.ComponentProps<'div'>

/**
 * The row's title. Render it as a link (`render={<a href="…">Title</a>}`) or a button to make it the
 * row's primary action: the whole row becomes its hit area (a stretched link) and takes the
 * hover and focus ring, while buttons in ItemActions, ItemHeader and ItemFooter stay separate
 * controls above it. Use this instead of `Item render={<a />}` when the row also carries its
 * own buttons, which cannot sit inside a link.
 */
export function ItemTitle({ className, render, ...props }: ItemTitleProps): React.ReactElement {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn('a63-ItemTitle', className),
        'data-slot': 'item-title',
      } as React.ComponentProps<'div'>,
      props
    ),
    render,
  })
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
