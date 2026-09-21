'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type * as React from 'react'
import { useLightboxConfig, useLightboxState } from './context'

export type LightboxZoomInProps = useRender.ComponentProps<'button'>

/** Zooms into the active item's media. */
export function LightboxZoomIn({
  className,
  render,
  ...props
}: LightboxZoomInProps): React.ReactElement {
  const { items, labels } = useLightboxConfig()
  const { index, zoomIn } = useLightboxState()
  const item = items[index]

  const defaultProps = {
    'aria-label': item ? labels.zoomIn(item.title) : undefined,
    className,
    'data-slot': 'media-lightbox-zoom-in',
    onClick: zoomIn,
    type: 'button' as const,
  }

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  })
}

export type LightboxZoomOutProps = useRender.ComponentProps<'button'>

/** Zooms back out of the active item's media; disabled while not zoomed. */
export function LightboxZoomOut({
  className,
  render,
  ...props
}: LightboxZoomOutProps): React.ReactElement {
  const { items, labels } = useLightboxConfig()
  const { index, isZoomed, zoomOut } = useLightboxState()
  const item = items[index]
  const disabled = !isZoomed

  const defaultProps = {
    'aria-label': item ? labels.zoomOut(item.title) : undefined,
    className,
    'data-slot': 'media-lightbox-zoom-out',
    disabled,
    onClick: zoomOut,
    type: 'button' as const,
    ...(disabled ? { 'data-disabled': '' } : {}),
  }

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  })
}
