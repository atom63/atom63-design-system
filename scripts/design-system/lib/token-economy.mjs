/**
 * CSS custom-property analysis for the token economy check. Ported from the
 * atom63-vite harness (internal/harness/src/token-economy) when the design
 * system moved into this repository.
 */

const COMMENT = /\/\*[\s\S]*?\*\//g

/**
 * Parse CSS text into blocks of custom-property declarations keyed by selector
 * path; nested blocks are joined with ' > '.
 * @param {string} css
 * @returns {{ selector: string, decls: Record<string, string> }[]}
 */
export function parseCssBlocks(css) {
  const src = css.replace(COMMENT, '')
  const blocks = []
  const stack = []
  let buf = ''
  const flushDecls = raw => {
    const decls = {}
    for (const part of raw.split(';')) {
      const idx = part.indexOf(':')
      if (idx === -1) continue
      const name = part.slice(0, idx).trim()
      if (!name.startsWith('--')) continue
      decls[name] = part
        .slice(idx + 1)
        .trim()
        .replace(/\s+/g, ' ')
    }
    return decls
  }
  for (const ch of src) {
    if (ch === '{') {
      stack.push(buf.trim().replace(/\s+/g, ' '))
      buf = ''
    } else if (ch === '}') {
      const decls = flushDecls(buf)
      if (Object.keys(decls).length > 0) blocks.push({ selector: stack.join(' > '), decls })
      buf = ''
      stack.pop()
    } else {
      buf += ch
    }
  }
  return blocks
}

const BASE_SELECTORS = new Set([':root', ':root, .light', '.light', ':root,.light'])

/** Strip leading `@layer x > ` / `@media (...) > ` segments so nested base blocks are recognized. */
function stripAtRulePrefix(selector) {
  let s = selector
  while (s.startsWith('@')) {
    const gt = s.indexOf(' > ')
    if (gt === -1) break
    s = s.slice(gt + 3).trim()
  }
  return s
}

function isBaseSelector(selector) {
  return BASE_SELECTORS.has(stripAtRulePrefix(selector))
}

/** A child scope that sets a token to the exact value the base scope already gives it. */
export function findRestatements(blocks) {
  const baseValues = {}
  for (const b of blocks) {
    if (isBaseSelector(b.selector)) Object.assign(baseValues, b.decls)
  }
  const out = []
  for (const b of blocks) {
    if (isBaseSelector(b.selector)) continue
    for (const [token, value] of Object.entries(b.decls)) {
      if (baseValues[token] === value) out.push({ token, selector: b.selector, value })
    }
  }
  return out
}

const THEME_RE = /\[data-a63-theme="([a-z0-9]+)"\]/

/** A theme base def (no mode qualifier) overridden in BOTH :not(.dark) and .dark — never the effective value. */
export function findUnreachableBaseDefs(blocks) {
  const seen = new Map()
  for (const b of blocks) {
    const m = b.selector.match(THEME_RE)
    if (!m) continue
    const theme = m[1]
    const isDark = b.selector.includes('.dark') && !b.selector.includes(':not(.dark)')
    const isLight = b.selector.includes(':not(.dark)') || b.selector.includes('.light')
    const isBase = !isDark && !isLight && b.selector.replace(THEME_RE, '').trim() === ''
    let tokens = seen.get(theme)
    if (!tokens) {
      tokens = new Map()
      seen.set(theme, tokens)
    }
    for (const token of Object.keys(b.decls)) {
      const rec = tokens.get(token) ?? {}
      if (isBase) rec.base = true
      if (isLight) rec.light = true
      if (isDark) rec.dark = true
      tokens.set(token, rec)
    }
  }
  const out = []
  for (const [theme, tokens] of seen) {
    for (const [token, rec] of tokens) {
      if (rec.base && rec.light && rec.dark) out.push({ token, theme })
    }
  }
  return out
}

/** Theme-private tokens (--theme-* / --gel-*) that are defined but never referenced via var(). */
export function findUnusedThemePrivate(defined, referenced) {
  return [...defined].filter(t => !referenced.has(t)).sort()
}
