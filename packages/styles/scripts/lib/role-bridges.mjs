/**
 * Renders the two shadcn bridges from src/tailwind/roles.json: the semantic
 * `@theme inline` block of tailwind/theme.css (`--color-<role>`) and
 * compat/shadcn.css (`--<role>`). Both used to be hand-written copies of the
 * same table; generating them keeps the Tailwind utilities and the CSS
 * variables pointing at the same tokens.
 */

const MARKER =
  '/* Semantic roles — generated from src/tailwind/roles.json by scripts/generate-role-bridges.mjs; do not edit. */'
// The comment the hand-written block carried before the generator existed.
const LEGACY_MARKER =
  '/* tokens/semantics.css — map Tailwind color utilities onto the canonical --a63-* layer */'

/** The roles in table order, as [role, token] pairs. Throws on a duplicate role. */
export function roleEntries(table) {
  const entries = []
  const seen = new Set()
  for (const group of table.groups) {
    for (const [role, token] of Object.entries(group.roles)) {
      if (seen.has(role)) throw new Error(`roles.json lists "${role}" twice`)
      if (!/^--[a-z0-9-]+$/.test(token))
        throw new Error(`roles.json: "${role}" maps to "${token}", which is not a custom property`)
      seen.add(role)
      entries.push([role, token])
    }
  }
  return entries
}

/** Roles whose token is not declared anywhere in the token manifest. */
export function unknownTokens(table, declared) {
  return roleEntries(table).filter(([, token]) => !declared.has(token))
}

export function renderThemeBlock(table) {
  const lines = roleEntries(table).map(([role, token]) => `  --color-${role}: var(${token});`)
  return `${MARKER}\n@theme inline {\n${lines.join('\n')}\n}\n`
}

/** Replaces the semantic block of tailwind/theme.css, generated or hand-written. */
export function replaceThemeBlock(css, block) {
  const start = css.indexOf(MARKER) >= 0 ? css.indexOf(MARKER) : css.indexOf(LEGACY_MARKER)
  if (start < 0) throw new Error('tailwind/theme.css has no semantic roles block')
  const open = css.indexOf('@theme inline {', start)
  const close = css.indexOf('\n}\n', open)
  if (open < 0 || close < 0)
    throw new Error('tailwind/theme.css: the semantic roles block is not closed')
  return css.slice(0, start) + block + css.slice(close + 3)
}

const TYPE_MARKER =
  '/* Text roles — generated from src/tokens/type-roles.resolver.json by scripts/generate-role-bridges.mjs; do not edit. */'

/** The text role names in src/tokens/type-roles.resolver.json, in file order. */
export function typeRoleNames(doc) {
  const tokens = doc.sets?.base?.sources?.[0] ?? doc
  return Object.keys(tokens.a63.type)
}

/**
 * Tailwind text utilities for the text roles: `text-<role>` sets size, line
 * height and weight together; `text-<role>-strong` uses the emphasized weight.
 */
export function renderTypeBlock(doc) {
  const lines = typeRoleNames(doc).flatMap(role => {
    const v = name => `var(--a63-type-${role}-${name})`
    return [
      `  --text-${role}: ${v('font-size')};`,
      `  --text-${role}--line-height: ${v('line-height')};`,
      `  --text-${role}--font-weight: ${v('font-weight')};`,
      `  --text-${role}-strong: ${v('font-size')};`,
      `  --text-${role}-strong--line-height: ${v('line-height')};`,
      `  --text-${role}-strong--font-weight: ${v('font-weight-strong')};`,
    ]
  })
  return `${TYPE_MARKER}\n@theme inline {\n${lines.join('\n')}\n}\n`
}

/** Replaces the text role block of tailwind/theme.css, or appends it the first time. */
export function replaceTypeBlock(css, block) {
  const start = css.indexOf(TYPE_MARKER)
  if (start < 0) return `${css.trimEnd()}\n\n${block}`
  const close = css.indexOf('\n}\n', css.indexOf('@theme inline {', start))
  if (close < 0) throw new Error('tailwind/theme.css: the text role block is not closed')
  return css.slice(0, start) + block + css.slice(close + 3)
}

export function renderCompat(table) {
  const groups = table.groups.map(group => {
    const lines = Object.entries(group.roles).map(([role, token]) => `  --${role}: var(${token});`)
    return `  /* ${group.label} */\n${lines.join('\n')}`
  })
  return `/*
 * shadcn/ui compatibility bridge (opt-in).
 *
 * Generated from src/tailwind/roles.json by scripts/generate-role-bridges.mjs;
 * do not edit. Aliases the shadcn token vocabulary onto the canonical --a63-*
 * semantic layer, so shadcn-based components keep working without making those
 * names part of the core foundation. Import via \`@atom63/styles/compat/shadcn\`;
 * NOT part of the default bundle. Light and dark are resolved by the --a63-*
 * tokens, so every alias is mode-agnostic.
 */

:root {
${groups.join('\n\n')}
}
`
}
