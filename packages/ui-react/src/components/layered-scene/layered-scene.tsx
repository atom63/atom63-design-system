import {
  type LayeredScenePlacement,
  type LayeredSceneWidth,
  layeredSceneContract,
} from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { ArtPlate, type ArtPlateFocus, type ArtPlateProps } from '../art-plate/art-plate'

export type LayeredSceneProps = React.ComponentProps<'div'> & {
  /** Where the stage sits, and how the copy aligns: centred, or docked to the inline end or start. */
  placement?: LayeredScenePlacement
  /** Stage width from the medium breakpoint up. */
  width?: LayeredSceneWidth
}

/**
 * LayeredScene stacks three layers in one box: a plate at the back
 * (`LayeredScenePlate`, an ArtPlate), the copy (`LayeredSceneContent`) and live
 * product UI (`LayeredSceneStage`) in the middle, and an optional inert
 * cut-out of the plate in front (`LayeredSceneForeground`). It is for a landing
 * or portfolio hero where the interface sits inside the picture, not for a
 * plain image with text on it (use ArtPlate alone).
 */
export function LayeredScene({
  className,
  placement = layeredSceneContract.defaultPlacement,
  width = layeredSceneContract.defaultWidth,
  ...props
}: LayeredSceneProps): React.ReactElement {
  return (
    <div
      className={cn('a63-LayeredScene', className)}
      data-placement={placement}
      data-slot="layered-scene"
      data-width={width}
      {...props}
    />
  )
}

export type LayeredScenePlateProps = Omit<ArtPlateProps, 'children'>

/** The plate: an ArtPlate that spans the whole scene. Give the copy to LayeredSceneContent. */
export function LayeredScenePlate({
  className,
  ...props
}: LayeredScenePlateProps): React.ReactElement {
  return <ArtPlate className={cn('a63-LayeredScene-plate', className)} {...props} />
}

/** The copy above the stage: badge, headline, subhead and actions. */
export function LayeredSceneContent({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-LayeredScene-content', className)}
      data-slot="layered-scene-content"
      {...props}
    />
  )
}

/** The stage: live product UI, such as a Frame, docked at the bottom of the scene. */
export function LayeredSceneStage({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-LayeredScene-stage', className)}
      data-slot="layered-scene-stage"
      {...props}
    />
  )
}

export type LayeredSceneForegroundProps = Omit<
  React.ComponentProps<'div'>,
  'aria-hidden' | 'children'
> & {
  /** Same focal point as the plate, so the cut-out lines up with it. */
  focus?: ArtPlateFocus
  /** Same phone focal point as the plate. */
  focusMobile?: ArtPlateFocus
  /** Load eagerly, as for the hero plate. */
  priority?: boolean
  /** Keep the cut-out below the medium breakpoint too. By default phones drop it. */
  showOnPhone?: boolean
  sizes?: string
  /** A transparent cut-out of the plate, at the plate's size. */
  src: string
  srcSet?: string
}

const percent = (value: number) => `${Math.min(Math.max(value, 0), 1) * 100}%`

/**
 * The foreground: a transparent cut-out of the plate in front of the stage.
 * Decorative and inert (aria-hidden, no pointer events). Only padding, axes or
 * window edges may sit under it, never text or controls.
 */
export function LayeredSceneForeground({
  className,
  focus,
  focusMobile,
  priority = false,
  showOnPhone = false,
  sizes = '100vw',
  src,
  srcSet,
  style,
  ...props
}: LayeredSceneForegroundProps): React.ReactElement {
  const wide = focus ?? { x: 0.5, y: 0.5 }
  const narrow = focusMobile ?? wide
  const focusStyle = {
    '--a63-art-plate-focus': `${percent(wide.x)} ${percent(wide.y)}`,
    '--a63-art-plate-focus-mobile': `${percent(narrow.x)} ${percent(narrow.y)}`,
  } as React.CSSProperties

  return (
    <div
      aria-hidden="true"
      className={cn('a63-LayeredScene-foreground', className)}
      data-phone={showOnPhone ? 'show' : 'hide'}
      data-slot="layered-scene-foreground"
      style={{ ...focusStyle, ...style }}
      {...props}
    >
      <img
        alt=""
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        src={src}
        srcSet={srcSet}
      />
    </div>
  )
}
