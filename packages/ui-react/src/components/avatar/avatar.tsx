'use client'

import { type AvatarSize, avatarContract } from '@atom63/ui-foundation'
import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type AvatarProps = AvatarPrimitive.Root.Props & {
  size?: AvatarSize
}

/* Avatar — a user/entity image with a graceful fallback (Base UI Avatar).
   Faithful to prod @atom63/ui: a round frame with an inner hairline ring, three
   sizes via data-size, and an optional status Badge / group stack. */
export function Avatar({
  className,
  size = avatarContract.defaultSize,
  ...props
}: AvatarProps): React.ReactElement {
  return (
    <AvatarPrimitive.Root
      className={cn('a63-Avatar', className)}
      data-size={size}
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

export function AvatarBadge({
  className,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return <span className={cn('a63-Avatar-badge', className)} data-slot="avatar-badge" {...props} />
}

export function AvatarGroup({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Avatar-group', className)} data-slot="avatar-group" {...props} />
}

export function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Avatar-group-count', className)}
      data-slot="avatar-group-count"
      {...props}
    />
  )
}

export { AvatarPrimitive }
export type { AvatarSize }
