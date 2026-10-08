/**
 * Derived variables: a `color-mix(in oklch, var(--t) N%, transparent)` value a
 * component uses, as a variable whose value is Figma's composed color (an alias
 * to the token's variable at N% alpha). Figma overwrites a bound paint's own
 * opacity with the variable's alpha, so a semi-transparent token color can be
 * bound only through such a variable.
 *
 * A derived variable's web code syntax is the CSS expression itself, and its
 * token key is that expression in canonical form, so the sync engine matches it
 * by code syntax as it matches `var(--token)`. Pure: no Node or DOM imports.
 */

/** The collection derived variables live in, and its one mode. */
export const DERIVED_COLLECTION = 'Component'
export const DERIVED_MODE = 'Value'

const DERIVED =
  /^color-mix\(\s*in\s+oklch\s*,\s*var\(\s*(--[\w-]+)\s*\)\s+(\d+(?:\.\d+)?)%\s*,\s*transparent\s*\)$/

/** The canonical key (and code syntax) of `token` at `opacity` percent. */
export const derivedToken = (token: string, opacity: number) =>
  `color-mix(in oklch, var(${token}) ${opacity}%, transparent)`

/** The token and opacity a derived key or code syntax stands for. */
export function parseDerived(
  text: string | null | undefined
): { alias: string; opacity: number } | null {
  const match = text ? DERIVED.exec(text.trim()) : null
  if (!match) return null
  const opacity = Number(match[2])
  return opacity > 0 && opacity <= 100 ? { alias: match[1], opacity } : null
}

export const isDerivedToken = (token: string | null | undefined) => parseDerived(token) !== null

/**
 * A derived variable's name, by meaning (D4): the token's variable name, then
 * `alpha-N`, so `--a63-action-danger` at 10% is `action/danger/alpha-10`.
 * Figma names cannot hold a `.`, so 12.5% is `alpha-12_5`.
 */
export const derivedName = (sourceName: string, opacity: number) =>
  `${sourceName}/alpha-${String(opacity).replace('.', '_')}`
