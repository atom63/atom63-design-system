import type { ReactNode } from 'react'

import type { InformAction, InformSeverity } from '../core/types'

/**
 * Every surface is controlled: it renders what it is given and reports intent
 * upward. The runtime is one consumer of these components, not their owner.
 */
export type InformSurfaceProps = {
  severity?: InformSeverity
  /**
   * Decorative leading glyph, rendered in a fixed-size slot so the message
   * block does not shift with the icon's intrinsic size.
   *
   * Omit it for the severity's default glyph; pass `null` for no icon at all.
   * Anything you pass should be `aria-hidden`: severity must be carried by the
   * message text, not the glyph.
   */
  icon?: ReactNode
  /**
   * Optional media. Supported by the flyout, which renders it as a bounded
   * leading thumbnail, and the dialog, which renders it full width above the
   * text. The banner is a single-line bar and the spotlight is a coach mark
   * pinned to a control; neither has room for it, and both ignore it.
   */
  media?: ReactNode
  title?: ReactNode
  body: ReactNode
  actions?: readonly InformAction[]
  dismissable?: boolean
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
}
