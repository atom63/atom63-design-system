import { Avatar, AvatarFallback, AvatarImage } from '@atom63/ui-react'
import { LoaderCircle, RefreshCw } from 'lucide-react'
import { memo } from 'react'
import { cn } from '../utils'

export type WidgetAvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface WidgetAvatarProps {
  alt?: string
  /** Loading or shuffling: reveals the overlay and shows a spinner. */
  busy?: boolean
  className?: string
  fallback: string
  /** When provided, the avatar becomes a shuffle affordance (hover/focus reveal). */
  onShuffle?: () => void
  shuffleLabel?: string
  /** Draws the primary accent ring (e.g. the featured card avatar). */
  showOutline?: boolean
  size?: WidgetAvatarSize
  src?: string
  /**
   * Shows the decorative presence dot seated on the circle's lower-right.
   * The status meaning is conveyed textually elsewhere (e.g. a status badge),
   * so the dot itself is aria-hidden.
   */
  status?: boolean
}

/**
 * Circular avatar primitive with an optional shuffle overlay and a presence dot.
 * Chrome-agnostic and data-agnostic — widgets map their own data onto it.
 *
 * Per-size geometry (the avatar, the presence dot and the shuffle glyph) comes
 * from the stylesheet, keyed on `data-widget-avatar-size`. The status dot is
 * seated on the circle's lower-end arc, not the bounding-box corner.
 */
export const WidgetAvatar = memo<WidgetAvatarProps>(
  ({
    alt = '',
    busy = false,
    className,
    fallback,
    onShuffle,
    shuffleLabel = 'Shuffle avatar',
    showOutline = false,
    size = 'md',
    src,
    status = false,
  }) => {
    const canShuffle = Boolean(onShuffle)

    return (
      <div
        className={cn('a63-WidgetAvatar', className)}
        data-busy={busy ? '' : undefined}
        data-slot="widget-avatar"
        data-widget-avatar-size={size}
      >
        <Avatar className="a63-WidgetAvatar-avatar" data-outline={showOutline ? '' : undefined}>
          <AvatarImage alt={alt} src={src} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>

        {busy && <span aria-hidden className="a63-WidgetAvatar-busyRing" />}

        {canShuffle && (
          <button
            aria-label={shuffleLabel}
            className="a63-WidgetAvatar-shuffle"
            disabled={busy}
            onClick={onShuffle}
            type="button"
          >
            {busy ? (
              <LoaderCircle aria-hidden className="a63-WidgetAvatar-shuffleIcon a63-Widget-spin" />
            ) : (
              <RefreshCw aria-hidden className="a63-WidgetAvatar-shuffleIcon" />
            )}
          </button>
        )}

        {status && (
          // The notch ring matches the card surface the avatar sits on, not the
          // page, so the separator stays visible across themes and hosts.
          <span aria-hidden className="a63-WidgetAvatar-status" data-slot="widget-avatar-status" />
        )}
      </div>
    )
  }
)

WidgetAvatar.displayName = 'WidgetAvatar'
