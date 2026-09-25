import type { ReactNode } from 'react'

/** Where a message is shown. One at a time, except the corner flyout, which stacks. */
export type InformSurface = 'banner' | 'dialog' | 'corner-flyout' | 'spotlight'

export type InformSeverity = 'info' | 'success' | 'warning' | 'danger'

/**
 * `none` renders no dismiss affordance and never persists — for standing notices.
 * `session` clears when the tab closes; `persistent` survives it.
 */
export type InformDismissMode = 'none' | 'session' | 'persistent'

export type InformAction = {
  id: string
  label: ReactNode
  onSelect: () => void
  variant?: 'primary' | 'secondary'
}

export type InformContent = {
  /** Decorative leading glyph. Severity must still be carried by the text. */
  icon?: ReactNode
  /**
   * Optional media. Only the flyout and the dialog render it, and they render
   * it differently — see the surface docs.
   */
  media?: ReactNode
  title?: ReactNode
  body: ReactNode
  actions?: readonly InformAction[]
}

/** Everything the arbiter is allowed to know about the visitor's situation. */
export type InformContext = {
  pathname: string
  locale: string
  now: Date
}

export type InformMessage = {
  /** Stable identity and persistence key. */
  id: string
  surface: InformSurface
  severity: InformSeverity
  /** Higher wins. Ties break by declaration order in the registry. */
  priority: number
  content: InformContent | ((ctx: InformContext) => InformContent)
  dismiss: InformDismissMode
  /** Bump to re-show a message to visitors who dismissed the previous revision. Defaults to 1. */
  version?: number
  /** ISO 8601. */
  startsAt?: string
  /** ISO 8601. */
  endsAt?: string
  when?: (ctx: InformContext) => boolean
  /** CSS selector. Required on `spotlight`, forbidden elsewhere. */
  anchor?: string
}

export type InformRegistry = {
  messages: readonly InformMessage[]
}

/**
 * What each surface should show. The corner flyout is the one surface that
 * stacks, so it resolves to an ordered list rather than a single message —
 * highest priority first, which is both the visual and the reading order.
 */
export type InformResolution = {
  banner: InformMessage | null
  dialog: InformMessage | null
  spotlight: InformMessage | null
  'corner-flyout': readonly InformMessage[]
}

/*
 * How many flyouts may be visible at once. Bounded on purpose: a persistent
 * card has no timer to drain it, so an uncapped stack would only grow. Anything
 * beyond this waits and is promoted as visible cards are dismissed.
 */
export const INFORM_FLYOUT_STACK_LIMIT = 3

export const INFORM_SURFACES: readonly InformSurface[] = [
  'banner',
  'dialog',
  'corner-flyout',
  'spotlight',
]

/** Surfaces that take over the visitor's attention. At most one may resolve. */
export const INFORM_BLOCKING_SURFACES: readonly InformSurface[] = ['dialog', 'spotlight']

export const EMPTY_INFORM_RESOLUTION: InformResolution = Object.freeze({
  banner: null,
  dialog: null,
  'corner-flyout': [],
  spotlight: null,
})

export function resolveContent(message: InformMessage, ctx: InformContext): InformContent {
  return typeof message.content === 'function' ? message.content(ctx) : message.content
}
