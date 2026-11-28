'use client'

import {
  type AvatarRing,
  type AvatarShape,
  type AvatarSize,
  type AvatarSizeAlias,
  avatarContract,
} from '@atom63/ui-foundation'
import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type AvatarProps = AvatarPrimitive.Root.Props & {
  /**
   * A ring for a story or new activity, set off from the face by a gap of the
   * page surface. `unseen` draws `--a63-avatar-ring-fill`, the accent unless a
   * product sets it, for example to a gradient of the category palette; `seen`
   * draws a thin border-coloured ring. `true` is a deprecated alias of
   * `'unseen'`: pass `ring="unseen"`.
   */
  ring?: boolean | AvatarRing
  /** `square` suits organisations and apps; people stay `circle`. */
  shape?: AvatarShape
  /** `'default'` is a deprecated alias of `'md'`. */
  size?: AvatarSize | AvatarSizeAlias
}

/* Avatar — a user/entity image with a graceful fallback (Base UI Avatar).
   Faithful to prod @atom63/ui: a round frame with an inner hairline ring, three
   sizes via data-size, and an optional status Badge / group stack. */
export function Avatar({
  className,
  ring = false,
  shape = avatarContract.defaultShape,
  size = avatarContract.defaultSize,
  ...props
}: AvatarProps): React.ReactElement {
  return (
    <AvatarPrimitive.Root
      className={cn('a63-Avatar', className)}
      data-ring={ring === true ? 'unseen' : ring || undefined}
      data-shape={shape}
      data-size={size === 'default' ? 'md' : size}
      data-slot="avatar"
      {...props}
    />
  )
}

export function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.Image.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Image
      className={cn('a63-Avatar-image', className)}
      data-slot="avatar-image"
      {...props}
    />
  )
}

export function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Fallback
      className={cn('a63-Avatar-fallback', className)}
      data-slot="avatar-fallback"
      {...props}
    />
  )
}

export interface AvatarBadgeProps extends React.ComponentProps<'span'> {
  /**
   * What the badge means, such as "Online" or "Busy". The dot shows it by colour
   * only, so give every status badge a label: it is read after the avatar's name
   * and hidden from sight.
   */
  label?: string
}

export function AvatarBadge({
  children,
  className,
  label,
  ...props
}: AvatarBadgeProps): React.ReactElement {
  return (
    <span className={cn('a63-Avatar-badge', className)} data-slot="avatar-badge" {...props}>
      {children}
      {label ? <span className="a63-Avatar-sr-only">{label}</span> : null}
    </span>
  )
}

export function AvatarGroup({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Avatar-group', className)} data-slot="avatar-group" {...props} />
}

export interface AvatarGroupCountProps extends React.ComponentProps<'div'> {
  /**
   * The count in words for assistive technology, such as "5 more people". The
   * visible text ("+5") is then hidden from assistive technology.
   */
  label?: string
}

export function AvatarGroupCount({
  children,
  className,
  label,
  ...props
}: AvatarGroupCountProps): React.ReactElement {
  return (
    <div
      className={cn('a63-Avatar-group-count', className)}
      data-slot="avatar-group-count"
      {...props}
    >
      {label ? (
        <>
          <span aria-hidden>{children}</span>
          <span className="a63-Avatar-sr-only">{label}</span>
        </>
      ) : (
        children
      )}
    </div>
  )
}

export { AvatarPrimitive }
export type { AvatarSize }
