# Figma token sync, plan 4: relative colors in Node, and the template wired to the sync

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** An agent in a project started from the site template runs one command to sync the whole
token set to Figma, every color included. The engine computes the template's relative color
(`--primary-foreground`) itself, so the plugin and the CLI write the same 389 variables. The
template carries `@atom63/figma` as a dev dependency and tells people and agents how to use it.

**Architecture:**

- **Color parsing:** `parseColor` learns `oklch()`, both absolute and relative
  (`oklch(from <color> l c h / alpha)`). It evaluates channel expressions with `calc()`, `clamp()`,
  `min()` and `max()`, converts with the OKLCH math already in `ramp.ts`, and clips each channel
  to 0–1.
- **One computation:** the plugin's browser resolver already tries `parseColor` first, so the
  plugin and the CLI compute these colors with the same code.
- **Template copy:** a `template:pull` script refreshes the template copy in `@atom63/figma` from a
  checkout of the template repository.
- **The template:** after `@atom63/figma` is published as a beta, the template adds it with a
  `figma:sync` script, a Figma section in the README and a rule in `AGENTS.md`.

**Tech Stack:** TypeScript, Vitest, changesets (pre mode `beta`), and the Figma MCP server's
`use_figma` for the real-Figma run.

**Spec:** [figma-token-sync-spec.md](./figma-token-sync-spec.md), sections "Package:
`@atom63/figma`" ("The site template takes `@atom63/figma` as a dev dependency only") and
"Code to Figma". Plans 1–3 are merged.

**Decisions this plan makes inside the spec:**

- **Colors match each other, not Chrome.** Chrome converts OKLCH with lower precision. The CSS
  Color 4 reference math (drafts.csswg.org `conversions.js`) and `ramp.ts` agree to about 1e-6,
  and both differ from Chrome 152 by up to 1.25e-4 (measured on 2026-10-05). The sync compares
  colors to 1e-6, so the engine cannot follow the browser. It computes these colors itself, the
  plugin uses the same code, and the plugin's browser fallback stays only for forms the engine
  does not read (`hsl()`, `lab()`, and others).
- **Old plugin files update once.** A file that the plugin wrote before this change holds a
  browser-computed `--primary-foreground`. One sync updates it, and the next sync plans nothing.
  `--sidebar-primary-foreground` is an alias of it, so it does not change.
- **Publishing is a human step.** `@atom63/figma` is not on npm yet. It is published by merging
  the changesets release pull request ("chore: version packages"). That release also publishes
  the other packages with pending changesets. The executor stops and asks before this step.
- **The template copy stays in `@atom63/figma`.** `template:pull <template-dir>` refreshes it.
  The template's `AGENTS.md` says to run it after token changes in the template repository.

## Global Constraints

- Code is the only source of truth, so a sync never deletes a variable or a style.
- Colors compare with an absolute tolerance of 1e-6 per channel, and colors are packed with
  24 bits per channel. A computed color must be the same number on every run.
- The site template takes `@atom63/figma` as a dev dependency only. Nothing at run time depends on
  Atom63.
- Commits have Conventional Commit titles and English bodies that say what changed. Add a
  changeset for `@atom63/figma`.
- The template repository is private and separate: `~/Projects/atom63-site-template`,
  `atom63/atom63-site-template`. It uses Biome through Ultracite and checks with
  `pnpm typecheck`, `pnpm lint` and `pnpm build`.

## Review Focus

- **A light primary** (a yellow brand, `#ffff00`): `clamp(0.15, (0.57 - l) * 1000, 0.985)` takes
  the low branch and the foreground is near black, not near white. Pinned in Task 1.
- **An expression the engine cannot read** (`hsl(from …)`, `lab(from …)`, unbalanced
  parentheses, an unknown keyword): it returns null. The token is skipped with "a color that
  could not be computed here", and tokens that point at it are skipped too. It never becomes a
  wrong color. Pinned in Task 1.
- **The same input twice:** a relative color computes to the same channels on every call, so a
  second sync plans no update. Pinned in Task 1, with a real-Figma check in Task 4.
- **Alpha:** `/ 0.5`, `/ 50%` and an inherited alpha (`from rgba(0, 0, 0, 0.25)`) give the
  expected `a`, and alpha stays within 0–1. Pinned in Task 1.
- **A template change that does not reach the copy:** `template:pull` copies exactly the six token
  files and re-embeds them, and the guard test catches a stale embed. Pinned in Task 2.

---

## File structure

| File | Responsibility |
| --- | --- |
| `packages/figma/src/oklch-color.ts` | `evaluateChannel`, `parseOklch` |
| `packages/figma/src/css-model.ts` | `parseColor` falls through to `parseOklch` |
| `packages/figma/scripts/pull-template.mjs` | `pullTemplate(fromDir, toDir)` and the `template:pull` CLI |
| `apps/figma-plugin/src/utils/css-color.ts` | Comment only: the engine computes oklch() first |
| `~/Projects/atom63-site-template/{package.json,README.md,AGENTS.md,.gitignore}` | The template's sync wiring |

---

### Task 1: oklch() colors, absolute and relative, in Node

**Files:**

- Create: `packages/figma/src/oklch-color.ts`, `packages/figma/test/oklch-color.test.ts`
- Modify: `packages/figma/src/css-model.ts` (`parseColor`), `packages/figma/src/index.ts`,
  `packages/figma/test/project-sync.test.ts`, `packages/figma/test/cli.test.ts`,
  `apps/figma-plugin/src/utils/css-color.ts` (comment)

**Interfaces:**

- Consumes: `rgbToOklch`, `oklchToRgb` (`ramp.ts`), `SyncColor`, `parseColor`.
- Produces:

```ts
export function evaluateChannel(
  source: string,
  channels: Readonly<Record<string, number>>,
  percent: number
): number | null
export function parseOklch(
  expression: string,
  parseBase: (expression: string) => SyncColor | null
): SyncColor | null
```

`parseColor(expression)` returns the color for `oklch(...)` forms as well.

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/oklch-color.test.ts`:

```ts
import { parseColor } from '../src/css-model'
import { evaluateChannel, parseOklch } from '../src/oklch-color'

const FOREGROUND = 'clamp(0.15, (0.57 - l) * 1000, 0.985) calc(c * 0.06) h'

/** Chrome 152, `color(from <expr> srgb r g b / alpha)`, clipped to 0–1 (2026-10-05). */
const CHROME: [string, [number, number, number]][] = [
  ['rgba(5, 93, 210, 1)', [0.96246, 0.982337, 1]],
  ['rgba(199, 66, 0, 1)', [1, 0.972021, 0.960043]],
  ['rgba(0, 94, 51, 1)', [0.968281, 0.985877, 0.973315]],
  ['rgba(185, 28, 107, 1)', [1, 0.968582, 0.980814]],
  ['rgba(94, 10, 202, 1)', [0.979523, 0.974978, 1]],
  ['rgba(205, 12, 61, 1)', [1, 0.968243, 0.967913]],
  ['rgba(255, 255, 0, 1)', [0.0446749, 0.0456746, 0.0236109]],
]

describe('evaluateChannel', () => {
  const channels = { l: 0.3, c: 0.2, h: 250, alpha: 1 }

  it('evaluates the template foreground channels', () => {
    expect(evaluateChannel('clamp(0.15, (0.57 - l) * 1000, 0.985)', channels, 1)).toBe(0.985)
    expect(evaluateChannel('clamp(0.15, (0.57 - l) * 1000, 0.985)', { ...channels, l: 0.9 }, 1)).toBe(0.15)
    expect(evaluateChannel('calc(c * 0.06)', channels, 0.4)).toBeCloseTo(0.012, 10)
    expect(evaluateChannel('h', channels, 1)).toBe(250)
  })

  it('reads numbers, percentages, degrees, signs, min and max', () => {
    expect(evaluateChannel('50%', channels, 0.4)).toBeCloseTo(0.2, 10)
    expect(evaluateChannel('30deg', channels, 1)).toBe(30)
    expect(evaluateChannel('-l', channels, 1)).toBe(-0.3)
    expect(evaluateChannel('min(1, 2, -3)', channels, 1)).toBe(-3)
    expect(evaluateChannel('max(l, calc(l * 2))', channels, 1)).toBe(0.6)
    expect(evaluateChannel('none', channels, 1)).toBe(0)
  })

  it('refuses what it cannot read', () => {
    expect(evaluateChannel('x', channels, 1)).toBeNull()
    expect(evaluateChannel('calc(l * 2', channels, 1)).toBeNull()
    expect(evaluateChannel('l 2', channels, 1)).toBeNull()
    expect(evaluateChannel('clamp(1, 2)', channels, 1)).toBeNull()
  })
})

describe('parseOklch', () => {
  it.each(CHROME)('computes the template foreground on %s like Chrome', (base, expected) => {
    const color = parseOklch(`oklch(from ${base} ${FOREGROUND})`, parseColor)
    if (!color) throw new Error('no color')
    ;[color.r, color.g, color.b].forEach((value, index) =>
      expect(Math.abs(value - expected[index])).toBeLessThan(3e-4)
    )
    expect(color.a).toBe(1)
  })

  it('gives a near-black foreground on a light primary', () => {
    const color = parseOklch(`oklch(from rgba(255, 255, 0, 1) ${FOREGROUND})`, parseColor)
    expect(Math.max(color?.r ?? 1, color?.g ?? 1, color?.b ?? 1)).toBeLessThan(0.05)
  })

  it('returns the base color for l c h', () => {
    const color = parseOklch('oklch(from rgba(44, 127, 255, 1) l c h)', parseColor)
    expect(color?.r).toBeCloseTo(44 / 255, 6)
    expect(color?.g).toBeCloseTo(127 / 255, 6)
    expect(color?.b).toBeCloseTo(1, 6)
  })

  it('reads absolute oklch()', () => {
    expect(parseOklch('oklch(1 0 0)', parseColor)).toEqual({ r: 1, g: 1, b: 1, a: 1 })
    expect(parseOklch('oklch(0% 0 0)', parseColor)).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    const red = parseOklch('oklch(62.8% 0.2577 29.23deg)', parseColor)
    expect(red?.r).toBeCloseTo(1, 3)
    expect(red?.g).toBeCloseTo(0, 3)
    expect(red?.b).toBeCloseTo(0, 3)
  })

  it('reads alpha after a slash or from the base', () => {
    expect(parseOklch('oklch(from #000 l c h / 0.5)', parseColor)?.a).toBe(0.5)
    expect(parseOklch('oklch(from #000 l c h / 50%)', parseColor)?.a).toBe(0.5)
    expect(parseOklch('oklch(from rgba(0, 0, 0, 0.25) l c h)', parseColor)?.a).toBe(0.25)
    expect(parseOklch('oklch(from #000 l c h / 2)', parseColor)?.a).toBe(1)
  })

  it.each([
    'oklch(from nonsense l c h)',
    'oklch(l c h)',
    'oklch(0.5 0.1)',
    'oklch(0.5 0.1 30 /)',
    'oklch((0.5 0.1 30)',
    'hsl(from #000 h s l)',
  ])('refuses %s', expression => {
    expect(parseOklch(expression, parseColor)).toBeNull()
  })

  it('is what parseColor returns for oklch()', () => {
    expect(parseColor(`oklch(from rgba(5, 93, 210, 1) ${FOREGROUND})`)).toEqual(
      parseOklch(`oklch(from rgba(5, 93, 210, 1) ${FOREGROUND})`, parseColor)
    )
  })
})
```

In `packages/figma/test/project-sync.test.ts`:

- Replace the test "computes a relative color with the resolver, per mode" with:

```ts
  it('computes the relative foreground color per brand mode', () => {
    const { collection, variable } = find('--primary-foreground')
    expect(collection).toBe('Brand')
    const b1 = variable.values.b1
    if (!b1 || !('value' in b1) || typeof b1.value !== 'object') throw new Error('not a color')
    expect(b1.value.r).toBeCloseTo(0.96259, 5)
    expect(b1.value.b).toBe(1)
  })
```

- Replace the two tests "reports a relative color it cannot compute without a browser" and "skips
  a token that points at one it could not compute, and keeps the rest" with:

```ts
  const uncomputable = buildProjectModel([
    {
      name: 'tokens.css',
      text: ':root { --blue: #2563eb; --on-blue: lab(from var(--blue) 90 a b); --link: var(--on-blue); }',
    },
  ])

  it('reports a color it cannot compute in Node', () => {
    expect(uncomputable.model.skipped.find(item => item.token === '--on-blue')?.reason).toBe(
      'a color that could not be computed here'
    )
  })

  it('skips a token that points at one it could not compute, and keeps the rest', () => {
    expect(uncomputable.model.skipped.find(item => item.token === '--link')?.reason).toBe(
      'points at --on-blue, which is not synced'
    )
    expect(uncomputable.model.summary.variables).toBe(1)
  })
```

- Delete the `resolveColor` stand-in and build `project` with `buildProjectModel(files)`, if
  nothing else in the file uses `resolveColor`. If a test still uses it, keep it.

In `packages/figma/test/cli.test.ts`, change the "reports a relative color it cannot compute"
test's CSS to `:root { --blue: #2563eb; --on-blue: lab(from var(--blue) 90 a b); }`. Keep its
expectations (1 variable, `--on-blue` skipped).

Add to `packages/figma/test/template.test.ts`:

```ts
describe('the template set in Node', () => {
  it('holds every color, the relative foreground included', () => {
    const { model } = buildProjectModel(TEMPLATE_TOKENS)
    expect(model.summary.variables).toBe(389)
    const skipped = model.skipped.map(item => item.token)
    expect(skipped).not.toContain('--primary-foreground')
    expect(skipped).not.toContain('--sidebar-primary-foreground')
  })

  it('computes the same foreground twice', () => {
    const first = buildProjectModel(TEMPLATE_TOKENS).model
    const second = buildProjectModel(TEMPLATE_TOKENS).model
    const foreground = (model: typeof first) =>
      model.collections
        .flatMap(item => item.variables)
        .find(item => item.token === '--primary-foreground')
    expect(foreground(first)).toBeDefined()
    expect(foreground(second)).toEqual(foreground(first))
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- oklch-color project-sync`
Run as well: `pnpm --filter @atom63/figma test -- template`

Expected:
- FAIL: `../src/oklch-color` does not exist.
- FAIL: the project-sync foreground test, because `--primary-foreground` is skipped.
- FAIL: the template-set test, with 387 variables instead of 389.

- [ ] **Step 3: Implement `oklch-color.ts` and wire it into `parseColor`**

`packages/figma/src/oklch-color.ts`:

```ts
/**
 * oklch() colors, absolute (`oklch(62% 0.2 30)`) and relative
 * (`oklch(from <color> l c h / alpha)`), computed in Node: OKLCH to sRGB, each
 * channel clipped to 0–1 as the plugin's browser resolver clips. The plugin
 * tries this before the browser, so the plugin and the CLI write the same
 * numbers; Chrome's own conversion differs by about 1e-4.
 */
import type { SyncColor } from './plan'
import { oklchToRgb, rgbToOklch } from './ramp'

type Channels = Readonly<Record<string, number>>

/** Splits on whitespace and `/` outside parentheses; `/` stays as its own word. */
function words(source: string): string[] | null {
  const out: string[] = []
  let depth = 0
  let current = ''
  for (const char of source) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1
    if (depth < 0) return null
    if (depth === 0 && (/\s/.test(char) || char === '/')) {
      if (current) out.push(current)
      current = ''
      if (char === '/') out.push('/')
    } else current += char
  }
  if (depth !== 0) return null
  if (current) out.push(current)
  return out
}

/**
 * A channel value: a number (`%` scaled by `percent`, `deg` dropped), a channel
 * keyword (`l`, `c`, `h`, `alpha`), `none`, or calc(), clamp(), min() and max()
 * over + - * / and parentheses. Null for anything else.
 */
export function evaluateChannel(source: string, channels: Channels, percent: number): number | null {
  const text = source.trim().toLowerCase()
  let index = 0
  const skip = () => {
    while (/\s/.test(text[index] ?? '')) index += 1
  }
  const args = (): number[] | null => {
    const values: number[] = []
    for (;;) {
      const value = sum()
      if (value === null) return null
      values.push(value)
      skip()
      if (text[index] === ',') index += 1
      else if (text[index] === ')') {
        index += 1
        return values
      } else return null
    }
  }
  const primary = (): number | null => {
    skip()
    const func = /^(calc|clamp|min|max)\(/.exec(text.slice(index))
    if (func) {
      index += func[0].length
      const values = args()
      if (!values) return null
      if (func[1] === 'calc') return values.length === 1 ? values[0] : null
      if (func[1] === 'clamp')
        return values.length === 3 ? Math.max(values[0], Math.min(values[1], values[2])) : null
      return func[1] === 'min' ? Math.min(...values) : Math.max(...values)
    }
    if (text[index] === '(') {
      index += 1
      const value = sum()
      skip()
      if (value === null || text[index] !== ')') return null
      index += 1
      return value
    }
    const number = /^(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?(%|deg)?/.exec(text.slice(index))
    if (number) {
      index += number[0].length
      const value = Number.parseFloat(number[0])
      return number[1] === '%' ? (value / 100) * percent : value
    }
    const word = /^[a-z]+/.exec(text.slice(index))?.[0]
    if (word === 'none') {
      index += word.length
      return 0
    }
    if (word && word in channels) {
      index += word.length
      return channels[word]
    }
    return null
  }
  const unary = (): number | null => {
    skip()
    if (text[index] === '-') {
      index += 1
      const value = unary()
      return value === null ? null : -value
    }
    return primary()
  }
  const product = (): number | null => {
    let left = unary()
    for (;;) {
      skip()
      const operator = text[index]
      if (left === null || (operator !== '*' && operator !== '/')) return left
      index += 1
      const right = unary()
      if (right === null) return null
      left = operator === '*' ? left * right : left / right
    }
  }
  const sum = (): number | null => {
    let left = product()
    for (;;) {
      skip()
      const operator = text[index]
      if (left === null || (operator !== '+' && operator !== '-')) return left
      index += 1
      const right = product()
      if (right === null) return null
      left = operator === '+' ? left + right : left - right
    }
  }
  const value = sum()
  skip()
  return value !== null && index === text.length && Number.isFinite(value) ? value : null
}

export function parseOklch(
  expression: string,
  parseBase: (expression: string) => SyncColor | null
): SyncColor | null {
  const match = /^oklch\((.*)\)$/.exec(expression.trim().toLowerCase().replace(/\s+/g, ' '))
  let parts = match ? words(match[1]) : null
  if (!parts) return null
  let channels: Channels = {}
  if (parts[0] === 'from') {
    const base = parts[1] ? parseBase(parts[1]) : null
    if (!base) return null
    const { l, c, h } = rgbToOklch([base.r, base.g, base.b])
    channels = { l, c, h, alpha: base.a }
    parts = parts.slice(2)
  }
  const slash = parts.indexOf('/')
  const main = slash === -1 ? parts : parts.slice(0, slash)
  const alpha = slash === -1 ? [] : parts.slice(slash + 1)
  if (main.length !== 3 || (slash !== -1 && alpha.length !== 1)) return null
  const l = evaluateChannel(main[0], channels, 1)
  const c = evaluateChannel(main[1], channels, 0.4)
  const h = evaluateChannel(main[2], channels, 1)
  const a = alpha.length > 0 ? evaluateChannel(alpha[0], channels, 1) : (channels.alpha ?? 1)
  if (l === null || c === null || h === null || a === null) return null
  const [r, g, b] = oklchToRgb({ l, c: Math.max(0, c), h })
  return { r, g, b, a: Math.min(1, Math.max(0, a)) }
}
```

In `css-model.ts`:
- Import `parseOklch` from `./oklch-color`.
- Change the last line of `parseColor` from `return null` to `return parseOklch(value, parseColor)`.
- Change its doc comment to "A pure color reader for the forms token files use: rgb(a), hex,
  keywords, and oklch(), absolute or relative."

Add `export * from './oklch-color'` to `index.ts`.

In `apps/figma-plugin/src/utils/css-color.ts`, change the last sentence of the comment from
"Simple literals skip the round trip." to "Colors the engine reads (literals and oklch(), absolute
or relative) skip the round trip, so the plugin writes the same numbers as the CLI."

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @atom63/figma test && pnpm --filter @atom63/figma-plugin test`
Expected: PASS. If the `parseColor` lowercasing turns a base like `#ABC` into `#abc`, that is
expected, because `parseColor` already lowercases.

- [ ] **Step 5: Docs and changeset**

In `packages/figma/README.md`, change the skipped list in "Sync code to Figma" from "shadows, font
stacks, relative colors Node cannot compute, and tokens that point at those" to "shadows, font
stacks, colors in forms the engine does not read (it reads hex, rgb(), keywords and oklch(),
relative ones included), and tokens that point at those".

`.changeset/figma-relative-colors.md`:

```md
---
'@atom63/figma': minor
---

Compute `oklch()` colors in Node, absolute and relative (`oklch(from var(--primary) … )`), so `atom63-figma sync` writes the site template's whole token set, the foreground colors included. The Figma plugin computes them with the same code, so the plugin and the CLI write the same values.
```

- [ ] **Step 6: Commit**

```bash
git add packages/figma/src/oklch-color.ts packages/figma/src/css-model.ts packages/figma/src/index.ts packages/figma/test/oklch-color.test.ts packages/figma/test/project-sync.test.ts packages/figma/test/cli.test.ts packages/figma/test/template.test.ts packages/figma/README.md apps/figma-plugin/src/utils/css-color.ts .changeset/figma-relative-colors.md
git commit -m "feat(figma): compute oklch() colors, absolute and relative, in Node"
```

---

### Task 2: `template:pull` keeps the template copy current

**Files:**

- Create: `packages/figma/scripts/pull-template.mjs`, `packages/figma/test/pull-template.test.ts`
- Modify: `packages/figma/package.json` (script), `packages/figma/README.md`

**Interfaces:**

- Produces: `pullTemplate(fromDir: string, toDir: string): string[]`. It copies the six token
  files from `<fromDir>/src/styles/tokens` into `toDir`, returns their names, and throws when a
  file is missing. The CLI is `node scripts/pull-template.mjs <template-dir>`, run as
  `pnpm --filter @atom63/figma template:pull <template-dir>`. It copies the files into
  `template/tokens` and runs `embed-template.mjs`.

- [ ] **Step 1: Write the failing test**

`packages/figma/test/pull-template.test.ts`:

```ts
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// @ts-expect-error -- a plain ES module script without types
import { pullTemplate } from '../scripts/pull-template.mjs'

const NAMES = ['index', 'palette', 'axes', 'semantic', 'scale', 'theme']

function templateDir(skip?: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'template-'))
  mkdirSync(join(dir, 'src/styles/tokens'), { recursive: true })
  for (const name of NAMES)
    if (name !== skip) writeFileSync(join(dir, 'src/styles/tokens', `${name}.css`), `/* ${name} */`)
  writeFileSync(join(dir, 'src/styles/tokens', 'extra.css'), '/* not copied */')
  return dir
}

describe('pullTemplate', () => {
  it('copies exactly the six token files', () => {
    const to = mkdtempSync(join(tmpdir(), 'copy-'))
    expect(pullTemplate(templateDir(), to)).toEqual(NAMES.map(name => `${name}.css`))
    expect(readFileSync(join(to, 'axes.css'), 'utf8')).toBe('/* axes */')
    expect(() => readFileSync(join(to, 'extra.css'))).toThrow()
  })

  it('refuses a checkout without one of the files', () => {
    expect(() => pullTemplate(templateDir('theme'), mkdtempSync(join(tmpdir(), 'copy-')))).toThrow(
      'theme.css'
    )
  })
})
```

If the repository's TypeScript setup resolves `.mjs` imports without the directive, remove the
`@ts-expect-error` line; an unused directive is itself an error.

- [ ] **Step 2: Run the test to see it fail**

Run: `pnpm --filter @atom63/figma test -- pull-template`
Expected: FAIL, `../scripts/pull-template.mjs` does not exist.

- [ ] **Step 3: Implement**

`packages/figma/scripts/pull-template.mjs`:

```js
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The site template's token files, the ones buildTemplateFiles edits.
const NAMES = ['index', 'palette', 'axes', 'semantic', 'scale', 'theme'].map(name => `${name}.css`)

/** Copies the template's six token files from a checkout into `toDir`. */
export function pullTemplate(fromDir, toDir) {
  const source = join(fromDir, 'src/styles/tokens')
  for (const name of NAMES)
    if (!existsSync(join(source, name))) throw new Error(`${join(source, name)} does not exist`)
  for (const name of NAMES) copyFileSync(join(source, name), join(toDir, name))
  return NAMES
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const from = process.argv[2]
  if (!from) {
    process.stderr.write('usage: template:pull <path to atom63-site-template>\n')
    process.exit(1)
  }
  const pkg = resolve(fileURLToPath(import.meta.url), '../..')
  pullTemplate(resolve(from), join(pkg, 'template/tokens'))
  execFileSync('node', [join(pkg, 'scripts/embed-template.mjs')], { stdio: 'inherit' })
  process.stdout.write('Copied the template tokens; review the diff, then run the tests.\n')
}
```

In `packages/figma/package.json`, add `"template:pull": "node scripts/pull-template.mjs"`.

In `packages/figma/README.md`, under "For plugins", add the following:

> The template copy in `template/tokens` comes from `atom63-site-template`. After the template's
> tokens change, run `pnpm --filter @atom63/figma template:pull <path to the template checkout>`,
> review the diff and run the tests.

- [ ] **Step 4: Run the tests and the script**

Run: `pnpm --filter @atom63/figma test && pnpm --filter @atom63/figma template:pull ~/Projects/atom63-site-template && git status --short packages/figma`
Expected:
- The tests pass.
- The script copies the files and re-embeds them.
- `git status` shows no change, because the copy already matches the template at its HEAD.

- [ ] **Step 5: Commit, then open the pull request**

```bash
git add packages/figma/scripts/pull-template.mjs packages/figma/test/pull-template.test.ts packages/figma/package.json packages/figma/README.md
git commit -m "feat(figma): template:pull refreshes the bundled template tokens"
```

Before you push, verify the way CI does:

```bash
rm -rf packages/figma/dist
pnpm --filter @atom63/figma test && pnpm --filter @atom63/figma typecheck && pnpm --filter @atom63/figma lint && pnpm --filter @atom63/figma build
pnpm --filter @atom63/figma-plugin test && pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin lint && pnpm --filter @atom63/figma-plugin build
npx prettier --check packages/figma apps/figma-plugin docs/design-system .changeset
```

Push the branch and open the pull request against `main`. The user merges it after CI is green.

---

### Task 3: Publish `@atom63/figma` as a beta (human step)

- [ ] **Step 1: Confirm what the release carries**

Run: `gh pr list --search "chore: version packages" --state open` and
`gh pr view <number> --json body -q .body`.

Expected: after Tasks 1 and 2 merge, the release pull request lists `@atom63/figma@0.1.0-beta.<n>`.
It also lists the other packages that have pending changesets.

- [ ] **Step 2: Stop and ask**

Tell the user, in Chinese:

- The release pull request number.
- Every package it publishes, with its version.
- That merging it publishes them to npm under the `beta` tag.

Wait for the user to merge it, or to say so. Do not merge it yourself without that go-ahead.

- [ ] **Step 3: Confirm the publish**

Run: `npm view @atom63/figma dist-tags`
Expected: `beta` points at the new version. Note the version for Task 4.

---

### Task 4: The template uses the sync

All commands in this task run in `~/Projects/atom63-site-template`, a separate repository. Create a
branch `feat/figma-sync` from `main` there.

**Files (template repository):**

- Modify: `package.json`, `README.md`, `AGENTS.md`, `.gitignore`

- [ ] **Step 1: Add the dev dependency and the script**

```bash
cd ~/Projects/atom63-site-template
git checkout -b feat/figma-sync
pnpm add -D @atom63/figma@<version from Task 3>
```

In `package.json` `scripts`, after `"test:coverage"`, add:

```json
"figma:sync": "atom63-figma sync --tokens src/styles/tokens --out .figma-sync"
```

Append to `.gitignore`:

```
# Figma sync scripts (pnpm figma:sync)
.figma-sync
```

- [ ] **Step 2: Run it**

Run: `pnpm figma:sync`
Expected:
- The printed summary shows `"variables": 389` and styles with `"text": 13` and `"effects": 7`.
- `skipped` lists only shadows, font stacks and Tailwind wiring, with no color token.
- `.figma-sync` holds `sync-1.js`, `sync-2.js`, `check-1.js` and `check-2.js`.

- [ ] **Step 3: README**

In `README.md`, after the "Personalization axes" subsection and before "## Make it yours", add:

```md
### Figma

Figma follows the tokens; it never leads them. `@atom63/figma` (a dev dependency) writes the
tokens into a Figma file as variables, text styles (`Text/base`, …) and shadow styles
(`Shadow/md`, …), named by meaning with the CSS name in each variable's code syntax.

- **With a coding agent and the Figma MCP server:** ask the agent to sync the tokens to Figma,
  naming the file. It runs `pnpm figma:sync`, runs each `.figma-sync/sync-N.js` with the MCP
  server's `use_figma`, then the `check-N.js` scripts, which must report no creates and no
  updates. To bring edits a designer made in Figma back into the CSS, the agent runs
  `pnpm exec atom63-figma read` and `pnpm exec atom63-figma diff`.
- **Without an agent:** the Cipher plugin's Import reads the files in `src/styles/tokens`.

Sync again after the tokens change. A sync never deletes anything in Figma: variables and styles
made there stay, and tokens removed from the CSS are listed as orphaned.
```

In the "Scripts" table, add the row `| \`pnpm figma:sync\` | Write the scripts that sync the tokens to Figma (see Figma above) |` after the `pnpm test` row.

- [ ] **Step 4: AGENTS.md**

Add the following as rule 9, after rule 8:

```md
9. Keep Figma in step with the tokens, never the other way round. After changing
   `src/styles/tokens`, if the project has a Figma file, run `pnpm figma:sync` and the scripts
   it writes through the Figma MCP server (`use_figma`), then the check scripts, which must report
   no creates and no updates. For Figma edits, run `pnpm exec atom63-figma read` and `diff`, and
   change the CSS, not the Figma file.
```

- [ ] **Step 5: Verify and commit**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS. Biome may want the `package.json` script line formatted; run `pnpm lint:fix` if
so.

```bash
git add package.json pnpm-lock.yaml README.md AGENTS.md .gitignore
git commit -m "feat: sync the design tokens to Figma with @atom63/figma"
git push -u origin feat/figma-sync
gh pr create --repo atom63/atom63-site-template --base main --title "feat: sync the design tokens to Figma" --body-file <body>
```

Write the body in English, and end it with the attribution line from the session.

- [ ] **Step 6: Real-Figma run (agent path, Figma MCP server)**

1. Create a new Design file in the A63 team (`create_new_file`, plan key
   `team::1490840320782672544`).
2. Run `.figma-sync/sync-1.js` and then `sync-2.js` with `use_figma`.
   - Each must report `verification` with `create: 0` and `update: 0`.
   - The variables created across the two scripts must total 389.
   - `sync-2.js` must also report `styles.verification` with no `create` and no `update`.
3. Run `check-1.js` and `check-2.js`: no creates, no updates, and 20 styles unchanged.
4. On the plan-3 file the plugin created before this change (`viGpRvBkjOAngVvkbMHy4p`, brand
   `#e11d48`), run the sync scripts that `atom63-figma sync` writes from the six files the plugin
   exported for it.
   - To get those files, run `buildTemplateFiles({ brand: '#e11d48', neutral: 'n3', radius:
     'round', typeScale: 'large', font: 'Inter' })` and write its output to a scratch folder.
   - Expect exactly one update: `--primary-foreground`, whose browser math is replaced by the
     engine's. `--sidebar-primary-foreground` is an alias of it and stays unchanged.
   - A second run of the same scripts must report no updates.
5. Record the file keys and results in the template pull request description.

## Out of scope

- Reading `hsl()`, `lab()`, `lch()` and `color-mix()` in forms other than the composed colors the
  parser already reads.
- A CI check in the template repository that compares its tokens with the bundled copy (the
  copy is refreshed by hand with `template:pull`).
- Publishing the Figma plugin to the Figma Community.
- The deferred plugin minors listed in atom63/atom63-design-system#133.
