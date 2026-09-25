import type { InformSeverity } from '../core/types'

/*
 * `info` is deliberately neutral: it is the default editorial voice of the
 * system and must render exactly like the site's existing notice. Only the
 * louder severities spend color. The classes are defined in `inform-parts.css`.
 */
export const SEVERITY_BORDER_CLASS: Record<InformSeverity, string> = {
  info: 'a63-Inform-border-info',
  success: 'a63-Inform-border-success',
  warning: 'a63-Inform-border-warning',
  danger: 'a63-Inform-border-danger',
}

export const SEVERITY_TEXT_CLASS: Record<InformSeverity, string> = {
  info: 'a63-Inform-text-info',
  success: 'a63-Inform-text-success',
  warning: 'a63-Inform-text-warning',
  danger: 'a63-Inform-text-danger',
}
