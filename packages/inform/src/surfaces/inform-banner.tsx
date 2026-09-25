import type { ReactElement } from 'react'

import { cn } from '../lib/cn'
import { InformDismissButton } from './dismiss-button'
import { InformIconSlot } from './icon-slot'
import { resolveInformIcon } from './severity-icon'
import { InformActions } from './inform-actions'
import { SEVERITY_BORDER_CLASS, SEVERITY_TEXT_CLASS } from './severity'
import type { InformSurfaceProps } from './types'

/**
 * In-flow, non-interrupting notice. Stays in document flow so it scrolls away
 * with the page rather than competing with the sticky header.
 *
 * Text is start aligned. Both gutter slots are exactly one line tall, so laying
 * the row out from the top puts them on the first line's optical centre — which
 * is the same thing as the banner's centre when the message is a single line,
 * and stays anchored to the title when it is not.
 *
 * Padding is equal on both axes: the row's height now follows the text rather
 * than a 24px touch target, so equal padding reads as an equal well.
 */
export function InformBanner({
  actions,
  body,
  icon,
  className,
  dismissLabel,
  dismissable = false,
  onDismiss,
  severity = 'info',
  title,
}: InformSurfaceProps): ReactElement {
  const resolvedIcon = resolveInformIcon(icon, severity)

  return (
    <div
      aria-live="polite"
      className={cn('a63-InformBanner', SEVERITY_BORDER_CLASS[severity], className)}
      data-severity={severity}
      role="status"
    >
      {resolvedIcon === null ? null : <InformIconSlot>{resolvedIcon}</InformIconSlot>}
      {/*
        Title and body carry no margins of their own, so their line boxes would
        otherwise touch and leave only the leading (~2.5px) between them. One
        space unit reads as a grouped pair rather than a run-on.
      */}
      <div className="a63-Inform-content">
        {title === undefined ? null : (
          <p className={cn('a63-Inform-title', SEVERITY_TEXT_CLASS[severity])}>{title}</p>
        )}
        <p className="a63-Inform-body">{body}</p>
        {actions === undefined ? null : <InformActions actions={actions} />}
      </div>
      {dismissable ? <InformDismissButton label={dismissLabel} onDismiss={onDismiss} /> : null}
    </div>
  )
}
