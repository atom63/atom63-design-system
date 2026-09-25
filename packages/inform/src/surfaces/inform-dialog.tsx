import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from '@atom63/ui-react'
import type { ReactElement } from 'react'

import { cn } from '../lib/cn'
import { InformIconSlot } from './icon-slot'
import { InformMedia } from './media-slot'
import { resolveInformIcon } from './severity-icon'
import { InformActions } from './inform-actions'
import { SEVERITY_TEXT_CLASS } from './severity'
import type { InformSurfaceProps } from './types'

export type InformDialogProps = InformSurfaceProps & {
  open: boolean
}

/**
 * Blocking notice. Focus trapping, Escape, scroll locking, and background
 * inerting come from the Base UI dialog underneath — do not reimplement them.
 * `DialogPopup` already renders its own portal, backdrop, and close button.
 */
export function InformDialog({
  actions,
  body,
  className,
  dismissable = true,
  icon,
  media,
  onDismiss,
  open,
  severity = 'info',
  title,
}: InformDialogProps): ReactElement {
  const resolvedIcon = resolveInformIcon(icon, severity)

  return (
    <Dialog
      onOpenChange={next => {
        if (!next) onDismiss?.()
      }}
      open={open}
    >
      <DialogPopup
        className={cn('a63-InformDialog', className)}
        data-severity={severity}
        showCloseButton={dismissable}
      >
        <DialogHeader>
          {media === undefined ? null : <InformMedia>{media}</InformMedia>}
          {/*
            Same row structure as the other surfaces: the icon is a sibling of
            the text, not a child of the title. Nesting it inside the title
            indents only that line, leaving the body aligned with the icon
            rather than with the words above it.

            Inside DialogHeader, not around it: the header owns the dialog's
            padding, so a row wrapped around it would strand the icon outside
            the padded area.
          */}
          <div className="a63-InformDialog-row">
            {resolvedIcon === null ? null : <InformIconSlot>{resolvedIcon}</InformIconSlot>}
            {/*
              Vertical rhythm stays the dialog's own. It is a larger surface
              than the banner or the flyout and the design system already sets
              its title-to-description gap; overriding it here would make an
              inform dialog sit differently from every other dialog in the app.
            */}
            <div className="a63-InformDialog-text">
              {title === undefined ? null : (
                <DialogTitle className={SEVERITY_TEXT_CLASS[severity]}>{title}</DialogTitle>
              )}
              <DialogDescription>{body}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {actions === undefined ? null : (
          <DialogFooter>
            <InformActions actions={actions} />
          </DialogFooter>
        )}
      </DialogPopup>
    </Dialog>
  )
}
