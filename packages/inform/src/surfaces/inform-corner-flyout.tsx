import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'

import { cn } from '../lib/cn'
import { InformDismissButton } from './dismiss-button'
import { InformIconSlot } from './icon-slot'
import { InformThumbnail } from './media-slot'
import { resolveInformIcon } from './severity-icon'
import { InformActions } from './inform-actions'
import { SEVERITY_TEXT_CLASS } from './severity'
import type { InformSurfaceProps } from './types'

export type InformCornerFlyoutProps = InformSurfaceProps & {
  open: boolean
}

/**
 * Kept in step with the exit transition in `inform-corner-flyout.css`
 * (`--a63-control-feedback-duration`, 150ms), so the card is gone once it lands.
 */
const LEAVE_DURATION_MS = 150

/**
 * Persistent, non-blocking card. Unlike a toast it has a registry identity,
 * holds rich content, and waits to be dismissed instead of expiring on a timer.
 *
 * Placement belongs to `InformFlyoutStack`, not here: several cards share one
 * anchor point and have to reflow together as they are dismissed.
 */
export function InformCornerFlyout({
  actions,
  body,
  className,
  dismissLabel,
  dismissable = true,
  icon,
  media,
  onDismiss,
  open,
  severity = 'info',
  title,
}: InformCornerFlyoutProps): ReactElement | null {
  const resolvedIcon = resolveInformIcon(icon, severity)
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (leaveTimer.current !== null) clearTimeout(leaveTimer.current)
    },
    []
  )

  /*
   * The card animates itself out and only then reports the dismissal, because
   * the moment it reports one the store drops the message and unmounts it —
   * there would be nothing left to animate. Doing it here rather than through
   * presence machinery in the stack keeps the exit next to the entrance.
   */
  const requestDismiss = (): void => {
    if (leaving) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

    if (reduced) {
      onDismiss?.()
      return
    }

    setLeaving(true)
    leaveTimer.current = setTimeout(() => {
      onDismiss?.()
    }, LEAVE_DURATION_MS)
  }

  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }

    // One frame at the initial transform so the transition has something to
    // animate from; without it React paints the final state directly.
    const frame = requestAnimationFrame(() => {
      setEntered(true)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      aria-live="polite"
      className={cn('a63-InformCornerFlyout', className)}
      data-leaving={leaving ? '' : undefined}
      data-severity={severity}
      data-state={entered ? 'entered' : 'entering'}
      role="status"
    >
      <div className="a63-Inform-row">
        {/*
          Media stands in for the icon rather than joining it: they are both the
          leading visual, and a card carrying a thumbnail AND a severity glyph
          reads as two competing subjects.
        */}
        {media !== undefined ? (
          <InformThumbnail>{media}</InformThumbnail>
        ) : resolvedIcon === null ? null : (
          <InformIconSlot>{resolvedIcon}</InformIconSlot>
        )}
        <div className="a63-Inform-content">
          {title === undefined ? null : (
            <p className={cn('a63-Inform-title', SEVERITY_TEXT_CLASS[severity])}>{title}</p>
          )}
          <p className="a63-Inform-body">{body}</p>
          {actions === undefined ? null : <InformActions actions={actions} />}
        </div>
        {dismissable ? (
          <InformDismissButton label={dismissLabel} onDismiss={requestDismiss} />
        ) : null}
      </div>
    </div>
  )
}
