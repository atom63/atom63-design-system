import type {
  CardContentPadding,
  CardLineClamp,
  CardPadding,
  CardVariant,
} from '@atom63/ui-foundation'
import { cardContract } from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type * as React from 'react'

import { cn } from '../../lib/cn'

/** A content/footer padding: a single preset, or `{ base, sm }` where `sm`
 * applies once the Card's own width crosses the container-query threshold
 * (see the `@container` block in card.css) — responds to the card, not the viewport. */
export type CardResponsivePadding =
  CardContentPadding | { base?: CardContentPadding; sm?: CardContentPadding }

function paddingAttrs(
  padding: CardResponsivePadding,
  fallback: CardContentPadding
): Record<string, string> {
  if (typeof padding === 'object') {
    return {
      'data-padding': padding.base ?? fallback,
      ...(padding.sm ? { 'data-padding-sm': padding.sm } : {}),
    }
  }
  return { 'data-padding': padding }
}

export type CardProps = useRender.ComponentProps<'div'> & {
  variant?: CardVariant
  padding?: CardPadding
}

export function Card({
  className,
  render,
  variant = cardContract.defaultVariant,
  padding,
  ...props
}: CardProps): React.ReactElement {
  const resolvedPadding = padding ?? (variant === 'overlay' ? 'none' : 'md')
  const defaultProps = {
    className: cn('a63-Card', className),
    'data-slot': 'card',
    'data-variant': variant,
    'data-padding': resolvedPadding,
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export type CardHeaderProps = useRender.ComponentProps<'div'> & { padding?: CardPadding }

export function CardHeader({
  className,
  render,
  padding = 'md',
  ...props
}: CardHeaderProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-header', className),
    'data-slot': 'card-header',
    'data-padding': padding,
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export function CardLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<'span'>): React.ReactElement {
  const defaultProps = { className: cn('a63-Card-label', className), 'data-slot': 'card-label' }
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(defaultProps, props),
    render,
  })
}

export type CardMediaProps = useRender.ComponentProps<'div'> & {
  aspectRatio?: string
  /** Subtle zoom of the media on card hover (default true). */
  hoverScale?: boolean
}

export function CardMedia({
  className,
  render,
  aspectRatio,
  hoverScale = true,
  style,
  ...props
}: CardMediaProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-media', className),
    'data-slot': 'card-media',
    ...(hoverScale ? { 'data-hover-scale': '' } : {}),
    style: aspectRatio ? { aspectRatio, ...style } : style,
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export type CardMediaOverlayProps = useRender.ComponentProps<'div'> & { aspectRatio?: string }

export function CardMediaOverlay({
  className,
  render,
  aspectRatio,
  style,
  ...props
}: CardMediaOverlayProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-media-overlay', className),
    'data-slot': 'card-media-overlay',
    ...(aspectRatio ? { 'data-aspect': '' } : {}),
    style: aspectRatio ? { aspectRatio, ...style } : style,
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export function CardMediaOverlayImage({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-media-overlay-image', className),
    'data-slot': 'card-media-overlay-image',
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export function CardMediaOverlayScrim({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-media-overlay-scrim', className),
    'data-slot': 'card-media-overlay-scrim',
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export function CardMediaOverlayTopRight({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-media-overlay-top-right', className),
    'data-slot': 'card-media-overlay-top-right',
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export function CardMediaOverlayBottom({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-media-overlay-bottom', className),
    'data-slot': 'card-media-overlay-bottom',
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export function CardMediaOverlayIconButton({
  className,
  render,
  ...props
}: useRender.ComponentProps<'span'>): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-media-overlay-icon-button', className),
    'data-slot': 'card-media-overlay-icon-button',
  }
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(defaultProps, props),
    render,
  })
}

export type CardContentProps = useRender.ComponentProps<'div'> & { padding?: CardResponsivePadding }

export function CardContent({
  className,
  render,
  padding = 'md',
  ...props
}: CardContentProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-content', className),
    'data-slot': 'card-content',
    ...paddingAttrs(padding, 'md'),
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export type CardTitleProps = useRender.ComponentProps<'span'> & { lineClamp?: CardLineClamp }

export function CardTitle({
  className,
  render,
  lineClamp = 2,
  ...props
}: CardTitleProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-title', className),
    'data-slot': 'card-title',
    ...(lineClamp ? { 'data-line-clamp': String(lineClamp) } : {}),
  }
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(defaultProps, props),
    render,
  })
}

export type CardDescriptionProps = useRender.ComponentProps<'span'> & { lineClamp?: CardLineClamp }

export function CardDescription({
  className,
  render,
  lineClamp = 3,
  ...props
}: CardDescriptionProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-description', className),
    'data-slot': 'card-description',
    ...(lineClamp ? { 'data-line-clamp': String(lineClamp) } : {}),
  }
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(defaultProps, props),
    render,
  })
}

export function CardTags({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = { className: cn('a63-Card-tags', className), 'data-slot': 'card-tags' }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export type CardFooterProps = useRender.ComponentProps<'div'> & { padding?: CardResponsivePadding }

export function CardFooter({
  className,
  render,
  padding = 'md',
  ...props
}: CardFooterProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-footer', className),
    'data-slot': 'card-footer',
    ...paddingAttrs(padding, 'md'),
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

export function CardAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = { className: cn('a63-Card-action', className), 'data-slot': 'card-action' }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

/**
 * The pointer-following "cursor label" pill (e.g. "Open link ↗" on link-style
 * cards). Positioned by the `--a63-card-cursor-x/y` custom props the card sets;
 * shown only while the card carries `[data-cursor-active]`. Drive it with the
 * `useCardCursor` hook (motion-free by default; pass `onMove` to wire your own
 * motion lib for spring smoothing — see the hook).
 */
export function CardCursorLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Card-cursor-label', className),
    'data-slot': 'card-cursor-label',
  }
  return useRender({ defaultTagName: 'div', props: mergeProps<'div'>(defaultProps, props), render })
}

/** Unclipped `<a>` wrapper class — interactive lift/shadow aren't cut off; focus ring included. */
export const cardLinkClassName = 'a63-CardLink'
