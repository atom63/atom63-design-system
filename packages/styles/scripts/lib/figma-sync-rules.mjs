/**
 * Rules the Figma sync generator applies to every variable, kept here so they are
 * reviewed in one place and unit-tested without a browser.
 *
 * - composedTarget: which color-mix() values become Figma composed colors.
 * - scopesFor: which Figma pickers show a variable. Foundation primitives are
 *   hidden (still aliasable), so a designer picks the semantic token, the Figma
 *   side of "take values from semantic tokens". A number that fits no rule fails
 *   the build: a wrong number scope hides a token from the picker it belongs in.
 * - codeSyntaxFor: what Dev Mode shows as the web code for a variable.
 */

const PERCENT = String.raw`\s*(\d+(?:\.\d+)?)%`
const COLOR_FIRST = new RegExp(
  String.raw`^color-mix\(\s*in [\w-]+\s*,\s*var\((--[\w-]+)\)(?:${PERCENT})?\s*,\s*transparent(?:${PERCENT})?\s*\)$`
)
const TRANSPARENT_FIRST = new RegExp(
  String.raw`^color-mix\(\s*in [\w-]+\s*,\s*transparent(?:${PERCENT})?\s*,\s*var\((--[\w-]+)\)(?:${PERCENT})?\s*\)$`
)

/**
 * `color-mix(in <space>, var(--x) N%, transparent)`, in either order and with the
 * weight on either side, is --x at N% opacity: Figma's composed color, which
 * keeps the alias. Mixing with transparent gives the same color in any space.
 * Returns `{ alias, opacity }` (opacity 0–100) when --x is a synced variable.
 */
export function composedTarget(raw, synced) {
  const text = raw.trim()
  const colorFirst = COLOR_FIRST.exec(text)
  const transparentFirst = TRANSPARENT_FIRST.exec(text)
  const [alias, own, other] = colorFirst
    ? [colorFirst[1], colorFirst[2], colorFirst[3]]
    : transparentFirst
      ? [transparentFirst[2], transparentFirst[3], transparentFirst[1]]
      : []
  if (!alias || !synced.has(alias)) return null
  const opacity = own !== undefined ? Number(own) : other !== undefined ? 100 - Number(other) : 50
  return { alias, opacity }
}

const FILLS = ['FRAME_FILL', 'SHAPE_FILL']

/** First match wins. `test` receives the token without `--` and `a63-`. */
const colorRules = [
  { group: 'neutral ramp', test: /^surface-(light|dark)-\d+$/, scopes: [] },
  { group: 'text', test: /(^|-)(text|foreground|fg)(-|$)/, scopes: ['TEXT_FILL'] },
  {
    group: 'stroke',
    test: /(^|-)(border|divider|ring|rim|outline)(-|$)/,
    scopes: ['STROKE_COLOR'],
  },
  { group: 'effect', test: /(^|-)(shadow|glow)(-|$)/, scopes: ['EFFECT_COLOR'] },
  { group: 'fill', test: /./, scopes: FILLS },
]

const numberRules = [
  { group: 'radius', test: /radius/, scopes: ['CORNER_RADIUS'] },
  { group: 'font size', test: /font-size/, scopes: ['FONT_SIZE'] },
  { group: 'line height', test: /line-height|leading/, scopes: ['LINE_HEIGHT'] },
  { group: 'letter spacing', test: /letter-spacing|tracking/, scopes: ['LETTER_SPACING'] },
  { group: 'font weight', test: /font-weight/, scopes: ['FONT_WEIGHT'] },
  {
    group: 'stroke width',
    test: /border-width|ring-width|rim-width|stroke/,
    scopes: ['STROKE_FLOAT'],
  },
  { group: 'opacity', test: /opacity/, scopes: ['OPACITY'] },
  { group: 'blur', test: /(^|-)blur(-|$)/, scopes: ['EFFECT_FLOAT'] },
  {
    group: 'gap and padding',
    test: /(^|-)(gap|inset|padding|space|spacing|safe-area)(-|$)/,
    scopes: ['GAP'],
  },
  {
    group: 'size',
    test: /(^|-)(height|width|size|min-target|thumb-size)(-|$)/,
    scopes: ['WIDTH_HEIGHT'],
  },
  {
    group: 'no Figma field (motion, scales, stacking)',
    test: /(^|-)(duration|delay|scale|multiplier|tint|strength|z|layer|density|breakpoint|container)(-|$)/,
    scopes: [],
  },
]

const stringRules = [
  { group: 'font family', test: /(^|-)font(-family|-app)?(-|$)/, scopes: ['FONT_FAMILY'] },
  { group: 'other text', test: /./, scopes: [] },
]

/**
 * The Figma scopes of a variable, and the rule group that chose them. Returns
 * `null` for a number no rule covers.
 */
export function scopesFor({ token, type, collection }) {
  if (collection === 'Atom63 Foundation') return { group: 'foundation', scopes: [] }
  const name = token.replace(/^--(a63-)?/, '')
  const rules = type === 'COLOR' ? colorRules : type === 'FLOAT' ? numberRules : stringRules
  const rule = rules.find(candidate => candidate.test.test(name))
  return rule ? { group: rule.group, scopes: rule.scopes } : null
}

export function codeSyntaxFor(token) {
  return `var(${token})`
}
