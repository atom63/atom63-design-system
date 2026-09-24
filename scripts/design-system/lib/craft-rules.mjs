/**
 * Craft rules: mechanical checks for design-system source that a review can
 * miss. Each rule reports `{ rule, match, line }`; check-craft.mjs compares the
 * results against a committed baseline so existing debt can be paid down
 * without letting new debt in.
 *
 * - `raw-color`: component styles take color from tokens. Flags literal colors
 *   in CSS declarations and Tailwind palette or arbitrary color utilities in
 *   TS/TSX. `#0000` (the transparent "no shadow" idiom) and `transparent` pass,
 *   and so do masks, where a color only carries alpha.
 * - `physical-properties`: spacing, text alignment, side borders and corner
 *   radii use logical directions so layouts mirror in right-to-left scripts.
 *   `left`/`right` positioning is out of scope for now. Padding that follows a
 *   physical safe-area inset (`env(safe-area-inset-left)`) passes.
 * - `focus-visible`: focus styles follow `:focus-visible`, so a pointer press
 *   does not draw a keyboard focus ring. `:focus-within` passes, and so does a
 *   `:focus` rule or `focus:` utility that only removes the outline.
 *
 * Some physical directions are the point: a sheet docked to the left edge, or
 * an optical nudge on a glyph that never mirrors. CSS rules scoped to
 * `[data-side='left'|'right']` pass on their own. Anything else is exempted by
 * a `craft-allow: <rule>` comment, with a reason, on the same line or the line
 * above.
 */

const CSS_COMMENT = /\/\*[\s\S]*?\*\//g
const JS_COMMENT = /\/\*[\s\S]*?\*\/|(^|[^:\\])\/\/[^\n]*/g

const PALETTE =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|black|white'
const COLOR_UTILITY = `(?:bg|text|border(?:-[trblxyse])?|ring|ring-offset|fill|stroke|from|via|to|outline|decoration|caret|accent|divide|placeholder|shadow)`
const PALETTE_UTILITY = new RegExp(`^${COLOR_UTILITY}-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?$`)
const ARBITRARY_COLOR_UTILITY = new RegExp(
  `^${COLOR_UTILITY}-\\[(?:#|rgba?\\(|hsla?\\(|oklch\\(|oklab\\()`
)
const PHYSICAL_UTILITY =
  /^-?(?:ml|mr|pl|pr|scroll-ml|scroll-mr|scroll-pl|scroll-pr|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br)(?:-|$)|^text-(?:left|right)$/
const FOCUS_VARIANT = /(?:^|:)(?:group-|peer-)?focus:/
const FOCUS_RESET_UTILITY = /^(?:outline-none|outline-hidden|outline-0|ring-0|shadow-none)$/
const SAFE_AREA = /env\(safe-area-inset-(?:left|right)\)/

const CSS_LITERAL_COLOR =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\((?=\s*[\d.])|\boklab\((?=\s*[\d.])/g
const CSS_PHYSICAL_PROPERTY =
  /^(?:margin|padding|scroll-margin|scroll-padding)-(?:left|right)$|^border-(?:left|right)(?:-(?:width|style|color))?$|^border-(?:top|bottom)-(?:left|right)-radius$/
const CSS_FOCUS = /:focus(?![-\w])/
const CSS_FOCUS_RESET = /^(?:outline(?:-style)?\s*:\s*(?:none|0)|box-shadow\s*:\s*none)$/
const CSS_MASK_PROPERTY = /^(?:-webkit-)?mask(?:-image)?$/

const DATA_SIDE = /\[data-side=['"]?(?:left|right)\b/
const ALLOW = /craft-allow:\s*([a-z-]+)/g

/**
 * Drop violations a `craft-allow` comment exempts. A comment that shares its
 * line with code covers that line; a comment on a line of its own covers the
 * line below.
 */
function allowances(text) {
  const allowed = new Map()
  text.split('\n').forEach((line, index) => {
    const code = line.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/g, '').replace(/[{}\s]/g, '')
    const at = code ? index + 1 : index + 2
    for (const [, rule] of line.matchAll(ALLOW)) {
      if (!allowed.has(at)) allowed.set(at, new Set())
      allowed.get(at).add(rule)
    }
  })
  return found => found.filter(({ rule, line }) => !allowed.get(line)?.has(rule))
}

function lineAt(text, index) {
  let line = 1
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++
  return line
}

/** Blank out comments while keeping offsets, so line numbers stay right. */
function blank(text, pattern) {
  return text.replace(pattern, match => match.replace(/[^\n]/g, ' '))
}

/** True when the flat rule body starting at `start` only removes the outline. */
function onlyResetsFocus(src, start) {
  const end = src.indexOf('}', start)
  const declarations = src
    .slice(start, end === -1 ? undefined : end)
    .split(';')
    .map(part => part.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
  return declarations.length > 0 && declarations.every(part => CSS_FOCUS_RESET.test(part))
}

/**
 * @param {string} css
 * @returns {{ rule: string, match: string, line: number }[]}
 */
export function scanCss(css) {
  const src = blank(css, CSS_COMMENT)
  const found = []
  const selectors = []
  // A declaration is `name: value` ending at `;` or `}`; a selector ends at `{`.
  const statement = /([^{};]*)([{};])/g
  let m
  while ((m = statement.exec(src))) {
    const body = m[1]
    const offset = m.index + body.length - body.trimStart().length
    const text = body.trim()
    if (m[2] === '{') selectors.push(text)
    if (!text) {
      if (m[2] === '}') selectors.pop()
      continue
    }
    const line = lineAt(src, offset)
    if (m[2] === '{') {
      if (CSS_FOCUS.test(text) && !onlyResetsFocus(src, statement.lastIndex)) {
        found.push({ rule: 'focus-visible', match: text, line })
      }
      continue
    }
    // A declaration that ends its block (no trailing `;`) closes the block too.
    if (m[2] === '}') statement.lastIndex = m.index + body.length
    const colon = text.indexOf(':')
    if (colon === -1 || text.startsWith('@')) continue
    const property = text.slice(0, colon).trim()
    const value = text.slice(colon + 1).trim()
    const sided = selectors.some(selector => DATA_SIDE.test(selector))
    if (CSS_PHYSICAL_PROPERTY.test(property) && !sided) {
      found.push({ rule: 'physical-properties', match: property, line })
    }
    if (property === 'text-align' && /^(?:left|right)\b/.test(value) && !sided) {
      found.push({ rule: 'physical-properties', match: `text-align: ${value}`, line })
    }
    if (CSS_MASK_PROPERTY.test(property)) continue
    for (const color of value.match(CSS_LITERAL_COLOR) ?? []) {
      if (color === '#0000') continue
      found.push({ rule: 'raw-color', match: `${property}: ${color}`, line })
    }
  }
  return allowances(css)(found)
}

/**
 * Scan TS/TSX source for class-name utilities. Every whitespace-, quote-,
 * backtick- or brace-delimited token is a candidate, so class names in `cn()`,
 * `cva()` and template strings are all covered, and arbitrary values keep
 * their parentheses.
 * @param {string} source
 * @returns {{ rule: string, match: string, line: number }[]}
 */
export function scanSource(source) {
  const src = blank(source, JS_COMMENT)
  const found = []
  const token = /[^\s"'`{}]+/g
  let m
  while ((m = token.exec(src))) {
    const raw = m[0]
    // Strip variants (`md:`, `hover:`, `[&_p]:`) and the important modifier.
    const utility = raw.slice(raw.lastIndexOf(':') + 1).replace(/^!|!$/g, '')
    const line = () => lineAt(src, m.index)
    if (PALETTE_UTILITY.test(utility) || ARBITRARY_COLOR_UTILITY.test(utility)) {
      found.push({ rule: 'raw-color', match: raw, line: line() })
    }
    if (PHYSICAL_UTILITY.test(utility) && !SAFE_AREA.test(raw)) {
      found.push({ rule: 'physical-properties', match: raw, line: line() })
    }
    if (FOCUS_VARIANT.test(raw) && !FOCUS_RESET_UTILITY.test(utility)) {
      found.push({ rule: 'focus-visible', match: raw, line: line() })
    }
  }
  return allowances(source)(found)
}

/**
 * Count violations per `rule | file | match`. Line numbers drift with every
 * edit, so the baseline keys on what was written, not where.
 * @param {{ file: string, rule: string, match: string }[]} violations
 * @returns {Record<string, number>}
 */
export function countViolations(violations) {
  const counts = {}
  for (const { file, rule, match } of violations) {
    const key = `${rule} | ${file} | ${match}`
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)))
}

/**
 * Compare current counts to the baseline. `added` fails the check; `resolved`
 * means the baseline is stale and must shrink with the fix.
 * @param {Record<string, number>} current
 * @param {Record<string, number>} baseline
 */
export function compareToBaseline(current, baseline) {
  const added = []
  const resolved = []
  for (const [key, count] of Object.entries(current)) {
    const allowed = baseline[key] ?? 0
    if (count > allowed) added.push({ key, count: count - allowed })
  }
  for (const [key, allowed] of Object.entries(baseline)) {
    const count = current[key] ?? 0
    if (count < allowed) resolved.push({ key, count: allowed - count })
  }
  return { added, resolved }
}
