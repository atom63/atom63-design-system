import type { DestinationKind } from '@atom63/ui-react'

const SPECIAL_PROTOCOL = /^(mailto|tel|sms):/i

export interface WidgetDestination {
  /** Where it goes, from the widget's own runtime origin. */
  kind: DestinationKind
  /**
   * The href to actually render.
   *
   * For `internal` this is origin-relative (`/projects/x?a=1#b`) even when the
   * card authored an absolute URL, because that is what a router can route.
   * For `external` it is the href as authored.
   */
  href: string
}

/**
 * Resolve an `href` into the destination a widget should render.
 *
 * This has to happen at render, not in data: portfolio cards carry absolute
 * `https://atom63.io/...` hrefs, which are an in-app route on atom63.io and a
 * cross-origin link from os.atom63.io. The same card is genuinely both, so a
 * `kind` baked into the card would be wrong in one host.
 *
 * Normalising the href is the other half of that, and skipping it fails
 * silently rather than visibly: an absolute same-origin URL still points at the
 * right page, so the indicator looks correct and the anchor still works — but
 * every router-level behaviour is lost. On atom63.io, `DetailHrefLink` rejects
 * anything not starting with `/` and falls back to a plain navigation, so the
 * card reloads the whole site instead of opening the project overlay. Handing
 * back the path is what lets a host route it.
 *
 * `mailto:` / `tel:` / `sms:` are neither kind: they leave the web entirely and
 * neither icon describes that. Callers get `null` and should render no
 * indicator rather than guess.
 *
 * Off-origin during SSR is treated as external, matching `isExternalMdxHref` —
 * an absolute http(s) URL with no origin to compare against is the case where
 * assuming in-app navigation would break the link.
 */
export function resolveDestination(
  href: string | undefined,
  /**
   * Extra origins the running app answers for.
   *
   * The running origin alone is right in production and wrong everywhere a
   * change is tested: atom63.io's own cards author absolute
   * `https://atom63.io/...` hrefs, which compare as cross-origin on
   * `localhost` and on preview deployments. Prefer `useWidgetDestination`,
   * which reads these from the host.
   */
  appOrigins: readonly string[] = []
): WidgetDestination | null {
  if (!href) {
    return null
  }

  const value = href.trim()

  // `new URL('', base)` resolves to the current page rather than throwing, so
  // a blank href would otherwise report as an in-app destination.
  if (value === '') {
    return null
  }

  if (value.startsWith('//')) {
    return { kind: 'external', href: value }
  }

  // Already origin-relative — nothing to normalise.
  if (value.startsWith('#') || value.startsWith('/')) {
    return { kind: 'internal', href: value }
  }

  if (SPECIAL_PROTOCOL.test(value)) {
    return null
  }

  const base =
    typeof globalThis.window === 'undefined' ? undefined : globalThis.window.location.href

  try {
    const url = new URL(value, base)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }
    const isOwnOrigin =
      (base != null && url.origin === globalThis.window.location.origin) ||
      appOrigins.includes(url.origin)

    if (!isOwnOrigin) {
      return { kind: 'external', href: value }
    }
    return { kind: 'internal', href: `${url.pathname}${url.search}${url.hash}` }
  } catch {
    return null
  }
}

/** Just the kind, when the caller does not need the normalised href. */
export function resolveDestinationKind(
  href: string | undefined,
  appOrigins: readonly string[] = []
): DestinationKind | null {
  return resolveDestination(href, appOrigins)?.kind ?? null
}
