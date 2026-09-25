import type { ReactElement, ReactNode } from 'react'

import type { InformSeverity } from '../core/types'

/*
 * Hand-drawn rather than pulled from an icon library: the package ships with no
 * icon dependency, and four glyphs is not worth one. They share a 24px viewBox,
 * a 1.5 stroke, and round caps so they sit consistently in the icon slot.
 *
 * Decorative by contract — `aria-hidden` is set here, not left to the caller.
 * Severity is carried by the message text; a glyph with an accessible name only
 * adds noise to the surface's `role="status"` announcement.
 */
const PATHS: Record<InformSeverity, ReactElement> = {
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5h.01" strokeLinecap="round" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.5 21 19.5H3L12 4.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" strokeLinecap="round" />
    </>
  ),
  danger: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" strokeLinecap="round" />
    </>
  ),
}

export type InformSeverityIconProps = {
  severity: InformSeverity
}

export function InformSeverityIcon({ severity }: InformSeverityIconProps): ReactElement {
  return (
    <svg aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {PATHS[severity]}
    </svg>
  )
}

/**
 * Resolves the icon slot's contents.
 *
 * Omitting `icon` gets the severity's default glyph — a status message should
 * look like one without every call site restating it. Passing `null` opts out
 * explicitly, which is the escape hatch for surfaces that carry their meaning
 * some other way.
 */
export function resolveInformIcon(
  icon: ReactNode | undefined,
  severity: InformSeverity
): ReactNode {
  if (icon === undefined) return <InformSeverityIcon severity={severity} />
  return icon
}
