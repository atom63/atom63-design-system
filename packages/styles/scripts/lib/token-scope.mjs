/**
 * A custom property's var() references are resolved on the element that
 * declares it, and descendants inherit the result. A token declared only on
 * :root that reads a token some other selector redeclares (a mode, brand,
 * surface, radius or theme scope) is therefore computed once, with the root's
 * values, and a nested scope inherits that instead of recomputing it. Declare
 * such a token in the same contexts as what it reads.
 */

/** [token, scoped tokens it reads] for every root-only token that reads a scoped one. */
export function rootOnlyReadsOfScoped(entries) {
  const scopes = new Map()
  for (const { cssVar, scope } of entries) {
    if (!scopes.has(cssVar)) scopes.set(cssVar, new Set())
    scopes.get(cssVar).add(scope ?? ':root')
  }
  const isScoped = name => [...(scopes.get(name) ?? [])].some(scope => scope !== ':root')
  const found = new Map()
  for (const { cssVar, value } of entries) {
    if (isScoped(cssVar)) continue
    const reads = [...String(value).matchAll(/var\((--[\w-]+)/g)]
      .map(match => match[1])
      .filter(isScoped)
    if (reads.length > 0) found.set(cssVar, [...new Set([...(found.get(cssVar) ?? []), ...reads])])
  }
  return [...found].sort(([a], [b]) => a.localeCompare(b))
}
