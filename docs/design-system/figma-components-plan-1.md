# Figma components, plan 1: Button, from contract and recipe to a bound component set

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

Status: agreed on 2026-10-08; implemented.

**Goal:** An agent runs one command and the Figma file gets a `Button` component set whose
variants match the code's contract and whose fills, strokes, radii, padding, gap, height and type
are bound to the variables the token sync already wrote. Running it again changes nothing.

**Architecture:**

- **Read (Node, pure):** `readRecipe` reads `button.css` with a deliberately small CSS reader and,
  for every `Variant × Size × State` the contract lists, resolves each Figma property to a token
  alias, a composed alias (token at an opacity), a literal, or a skip with a reason. The result is
  a `ComponentModel`, generated and checked in like `atom63.figma-sync.json`.
- **Write (Figma, runs in `use_figma` and in tests):** `syncComponent(figma, model)` builds or
  updates the page, the component set and its variants, and binds properties with
  `setBoundVariable` / `setBoundVariableForPaint` to the variables found by code syntax (D5).
  It is written against a small `NodesApi` slice, like `VariablesApi`, so tests run on a fake.
- **Deliver:** `atom63-figma components` writes `use_figma` scripts under the 49,000-character
  limit, the same way `buildScripts` does for tokens; each returns `verification`, which must plan
  no `create` or `update`.

**Tech Stack:** TypeScript, Vitest, tsup (runtime IIFE `A63Figma`), the Figma MCP server's
`use_figma` for the real-Figma run, changesets (pre mode `beta`).

**Spec:** [figma-token-sync-spec.md](./figma-token-sync-spec.md), decision D6 ("Components come
in a later phase") and "Out of scope" ("A later phase generates Figma components from the
component contracts and links them to code with Code Connect"). Plans 1–4 are merged; the token
sync (variables, text and effect styles) is the base this plan binds to.

## Decisions this plan makes inside the spec

| # | Question | Proposal |
| --- | --- | --- |
| C1 | What is the source? | `buttonContract` (axes, slots, token slots) and `button.css` (values). No hand-written value table. A small per-component **anatomy** (which layers exist and which recipe property drives which Figma property) is code in `@atom63/figma`. |
| C2 | Which variant properties? | `Variant` (10) × `Size` (`xs`, `sm`, `md`, `lg`, `xl`) × `State` (`rest`, `hover`, `pressed`, `focusVisible`, `disabled`, `loading`) = 300 variants. `icon-*` sizes and `tile` are a later plan (different anatomy); they are listed under `skipped`. Component properties: `Label` (text), `Icon` (boolean, leading icon). |
| C3 | How is the component matched in Figma? | By name, as styles are: page `Components`, component set `Button`, each variant by its property values (`Variant=primary, Size=md, State=rest`). Layers are matched by the anatomy's layer names. Layers a designer adds are never touched or removed. |
| C4 | What CSS does the reader understand? | Only what Button needs, and it says so. Selectors: `.a63-Button`, with `[data-variant='…']`, `[data-size='…']`, and state selectors (below), `:where()` unwrapped. Values: `var(--x)` (following `--button-*` locals to an `--a63-*` token that the sync model holds), `var(--x, fallback)`, `transparent`, and `color-mix(in oklch, var(--t) N%, transparent)` → composed alias at N%. `calc()`/`max()` are evaluated with the model's default-mode values and written as **literals** (listed under `literals`, not bound). Anything else is skipped with a reason. Pseudo-elements (`::before`, `::after`) are skipped. |
| C5 | How do states map? | `:hover` → `hover`; `:active`, `[data-pressed]` → `pressed`; `:focus-visible` → `focusVisible`; `:disabled`, `[data-disabled]` → `disabled`; `[data-loading]` → `loading`. Cascade order: base → variant → size → state → variant+state, later wins. |
| C6 | How are effects drawn? | Focus ring (an `outline` in CSS) → a `DROP_SHADOW` effect with spread = ring width, blur 0, color bound to the ring token. Disabled → label opacity `0.56` (literal from the recipe). Loading → label opacity 0, spinner layer visible. Box shadows are skipped in this plan. |
| C7 | Which entry point? | The agent path only (`atom63-figma components`), as Atom63 itself is synced by the agent (plugin ARCHITECTURE "Atom63"). The plugin gets no component UI in this plan. |
| C8 | What blocks a build? | The token sync must have run: if a token the model binds has no variable with code syntax `var(--token)`, the script reports it under `missingVariables` and writes nothing. |

## Global constraints

- Code is the only source of truth (D2); the component set is regenerated from code, never read
  back in this plan.
- `@atom63/figma` stays free of DOM and Node imports in everything the runtime IIFE bundles.
- A second run plans `create: 0`, `update: 0` (`verification`), the same rule as the token sync.
- Each script is under 49,000 characters (`LIMIT` in `scripts.ts`), and each result under 20 KB
  (counts and short lists only, never node dumps).
- Never edit generated files by hand; the generator has a `--check` mode wired into CI.
- A change to `@atom63/figma` needs `pnpm changeset`.

---

## File structure

```
packages/figma/
├── src/
│   ├── components/
│   │   ├── model.ts            ComponentModel types (pure)
│   │   ├── css-rules.ts        tiny CSS reader: rules → { selector, declarations } (pure)
│   │   ├── recipe.ts           readRecipe(css, contract, anatomy, syncModel) → ComponentModel (pure)
│   │   ├── button-anatomy.ts   Button layers and property → recipe-variable map (pure)
│   │   ├── nodes-api.ts        NodesApi: the slice of the Figma node API the sync uses
│   │   ├── sync-component.ts   planComponent / applyComponent / syncComponent (runtime)
│   │   └── scripts.ts          buildComponentScripts(model) (Node)
│   ├── runtime.ts              + export syncComponentPart / checkComponentPart
│   └── cli.ts                  + `components` command
├── scripts/generate-components.mjs   writes generated/atom63.figma-components.json (--check)
├── generated/atom63.figma-components.json
└── test/
    ├── fake-nodes.ts           in-memory pages, frames, text, components, component sets
    ├── css-rules.test.ts
    ├── recipe.test.ts
    ├── sync-component.test.ts
    └── component-scripts.test.ts
```

---

### Task 1: The CSS rule reader

**Files:** Create `src/components/css-rules.ts`, `test/css-rules.test.ts`

**Interfaces — Produces:**

```ts
export interface CssRule {
  selectors: string[]                 // split on top-level commas, whitespace normalized
  declarations: Record<string, string> // last declaration wins, comments removed
}
export function readRules(css: string): CssRule[]
```

Nested at-rules (`@media`, `@supports`) are dropped and counted in a second return field later
(Task 3 reports them); this task only skips them.

- [ ] **Step 1: Write the failing test**

```ts
import { readRules } from '../src/components/css-rules'

it('reads selectors and declarations, ignoring comments and at-rules', () => {
  const css = `
    /* note */
    .a63-Button { --button-background: var(--a63-action-neutral); color: red; }
    .a63-Button:active,
    .a63-Button[data-pressed] { background-color: var(--button-state-active-background); }
    @media (forced-colors: active) { .a63-Button { border-color: ButtonText; } }
    .a63-Button[data-size='xs'] {
      --button-height: max(
        calc(var(--a63-control-height-xs) * var(--a63-density-scale, 1)),
        var(--a63-control-min-size)
      );
    }`
  expect(readRules(css)).toEqual([
    {
      selectors: ['.a63-Button'],
      declarations: { '--button-background': 'var(--a63-action-neutral)', color: 'red' },
    },
    {
      selectors: ['.a63-Button:active', '.a63-Button[data-pressed]'],
      declarations: { 'background-color': 'var(--button-state-active-background)' },
    },
    {
      selectors: [".a63-Button[data-size='xs']"],
      declarations: {
        '--button-height':
          'max( calc(var(--a63-control-height-xs) * var(--a63-density-scale, 1)), var(--a63-control-min-size) )',
      },
    },
  ])
})
```

- [ ] **Step 2:** `pnpm --filter @atom63/figma exec vitest run test/css-rules.test.ts` → FAIL
  (module not found).
- [ ] **Step 3: Implement**

```ts
export interface CssRule {
  selectors: string[]
  declarations: Record<string, string>
}

const squash = (text: string) => text.replace(/\s+/g, ' ').trim()

function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth--
    else if (char === separator && depth === 0) {
      parts.push(text.slice(start, index))
      start = index + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map(squash).filter(Boolean)
}

export function readRules(css: string): CssRule[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules: CssRule[] = []
  let index = 0
  while (index < source.length) {
    const open = source.indexOf('{', index)
    if (open === -1) break
    const prelude = squash(source.slice(index, open))
    let depth = 1
    let close = open + 1
    while (close < source.length && depth > 0) {
      if (source[close] === '{') depth++
      else if (source[close] === '}') depth--
      close++
    }
    const body = source.slice(open + 1, close - 1)
    index = close
    if (prelude.startsWith('@')) continue
    const declarations: Record<string, string> = {}
    for (const declaration of splitTopLevel(body, ';')) {
      const colon = declaration.indexOf(':')
      if (colon === -1) continue
      declarations[declaration.slice(0, colon).trim()] = squash(declaration.slice(colon + 1))
    }
    rules.push({ selectors: splitTopLevel(prelude, ','), declarations })
  }
  return rules
}
```

- [ ] **Step 4:** the test passes.
- [ ] **Step 5:** `git commit -m "feat(figma): read CSS rules for component recipes"`

### Task 2: Component model and Button anatomy

**Files:** Create `src/components/model.ts`, `src/components/button-anatomy.ts`

**Interfaces — Produces:**

```ts
// model.ts
import type { SyncValue } from '../plan'

export type FigmaProperty =
  | 'fill' | 'stroke' | 'strokeWeight' | 'cornerRadius' | 'height'
  | 'paddingInline' | 'itemSpacing' | 'fontSize' | 'lineHeight'
  | 'opacity' | 'visible' | 'size' | 'focusRing' | 'focusRingWidth'

/** A resolved value, or why it is not written. */
export type ComponentValue = SyncValue | { skipped: string }

export interface LayerSpec {
  name: string                         // Figma layer name: 'Button', 'Icon', 'Label', 'Spinner'
  kind: 'frame' | 'text'
  properties: Partial<Record<FigmaProperty, ComponentValue>>
}

export interface VariantSpec {
  /** Figma variant name, `Variant=primary, Size=md, State=rest`. */
  name: string
  coord: { variant: string; size: string; state: string }
  layers: LayerSpec[]                  // root first
}

export interface ComponentModel {
  schemaVersion: 1
  component: string                    // 'Button'
  page: string                         // 'Components'
  axes: { Variant: string[]; Size: string[]; State: string[] }
  defaults: { Variant: string; Size: string; State: 'rest' }
  label: string                        // default `Label` text property: 'Button'
  variants: VariantSpec[]
  /** Tokens the model binds; the script refuses to write if any has no variable. */
  tokens: string[]
  literals: { variant: string; layer: string; property: FigmaProperty; expression: string }[]
  skipped: { what: string; reason: string }[]
}
```

```ts
// button-anatomy.ts
import type { FigmaProperty } from './model'

export interface AnatomyLayer {
  name: string
  kind: 'frame' | 'text'
  /** Figma property → the CSS property or custom property it reads, in cascade terms. */
  reads: Partial<Record<FigmaProperty, string>>
  /** Values fixed by state, applied after the cascade (C6). */
  byState?: Partial<Record<string, Partial<Record<FigmaProperty, number | boolean>>>>
}

export const buttonAnatomy: { component: 'Button'; rootClass: '.a63-Button'; layers: AnatomyLayer[] } = {
  component: 'Button',
  rootClass: '.a63-Button',
  layers: [
    {
      name: 'Button',
      kind: 'frame',
      reads: {
        fill: 'background-color',
        stroke: 'border-color',
        strokeWeight: '--button-border-width',
        cornerRadius: '--button-radius',
        height: '--button-height',
        paddingInline: '--button-padding-inline',
        itemSpacing: '--button-gap',
        focusRing: '--button-focus-ring',
        focusRingWidth: '--a63-control-focus-ring-width',
      },
    },
    { name: 'Icon', kind: 'frame', reads: { size: '--button-icon-size' } },
    {
      name: 'Label',
      kind: 'text',
      reads: { fill: '--button-foreground', fontSize: 'font-size', lineHeight: 'line-height' },
      byState: { disabled: { opacity: 0.56 }, loading: { opacity: 0 } },
    },
    {
      name: 'Spinner',
      kind: 'frame',
      reads: { size: '--button-icon-size', stroke: '--button-loading-foreground' },
      byState: { rest: { visible: false }, hover: { visible: false }, pressed: { visible: false },
        focusVisible: { visible: false }, disabled: { visible: false }, loading: { visible: true } },
    },
  ],
}
```

The `background-color` / `border-color` reads go through the recipe's own declarations
(`background-color: var(--button-background)` on the base rule, `var(--button-state-hover-…)` on
`:hover`), so states come from the CSS, not from the anatomy. `opacity: 0.56` mirrors the
recipe's literal; Task 3 asserts the recipe still says `0.56` so the two cannot drift silently.

- [ ] **Step 1:** add a type-only test `test/recipe.test.ts` placeholder import compiling against
  both modules (`pnpm --filter @atom63/figma typecheck` passes).
- [ ] **Step 2:** `git commit -m "feat(figma): component model and Button anatomy"`

### Task 3: `readRecipe` — contract + CSS + sync model → ComponentModel

**Files:** Create `src/components/recipe.ts`, `test/recipe.test.ts`

**Interfaces:**
- Consumes: `readRules` (Task 1), `ComponentModel`, `buttonAnatomy` (Task 2), `SyncModel`
  (`plan.ts`), `evaluateNumber` (`css-model.ts`).
- Produces:

```ts
export interface RecipeInput {
  css: string
  contract: { variants: readonly string[]; sizes: readonly string[]; states: readonly string[];
    defaultVariant: string; defaultSize: string }
  anatomy: typeof buttonAnatomy
  sync: SyncModel
  /** C2: sizes outside this list go to `skipped`. */
  sizes: readonly string[]
}
export function readRecipe(input: RecipeInput): ComponentModel
```

**Algorithm (C4, C5):**

1. `readRules(css)`; keep rules whose every selector starts with `anatomy.rootClass`. For each
   selector compute `{ variant?, size?, state?, layer }`: strip `:where(...)` wrappers;
   `[data-variant='x']` → variant; `[data-size='x']` → size; state per C5; a descendant
   `.a63-Button-label` → layer `Label`; `::before`/`::after` or any other descendant → skip,
   record `{ what: selector, reason: 'pseudo-element' | 'descendant' }`; `:not(...)` inside
   `:where()` is dropped (it only guards disabled hover). A selector with `[data-size^='icon']`
   matches no size in `input.sizes`.
2. For a coordinate `(variant, size, state)` and layer, the effective declarations are the
   matching rules folded in order: base, variant, size, state, variant+state, size+state —
   later wins, same as specificity for this recipe.
3. To resolve a property: read the declaration; while it is `var(--button-…)` (or any name not
   in the sync model), look the name up in the same effective declarations and continue; stop at
   `var(--a63-…)` that the sync model holds → `{ alias: token }`. `var(--x, fb)` tries `--x`,
   then `fb`. `transparent` → `{ value: { r: 0, g: 0, b: 0, a: 0 } }`.
   `color-mix(in oklch, var(--t) N%, transparent)` → `{ composed: { alias: t, opacity: N } }`.
   An expression with `calc(`/`max(`/`min(` → substitute each `var()` with the token's
   default-mode literal from the sync model, `evaluateNumber`, write `{ value }` and add a
   `literals` entry. Anything else → `{ skipped: reason }`.
4. Apply `byState` overrides from the anatomy.
5. `tokens` = every alias / composed alias in the model, sorted, unique.

- [ ] **Step 1: Write the failing tests** (fixtures inline; a trimmed recipe and a two-token
  sync model)

```ts
import { readRecipe } from '../src/components/recipe'
import { buttonAnatomy } from '../src/components/button-anatomy'
import type { SyncModel } from '../src/plan'

const css = `
.a63-Button {
  --button-background: var(--a63-action-neutral);
  --button-border-color: var(--button-background);
  --button-state-hover-background: var(--a63-action-neutral-hover);
  --button-padding-inline: var(--a63-control-padding-inline-md);
  background-color: var(--button-background);
  border-color: var(--button-border-color);
}
.a63-Button:where(:not(:disabled, [data-disabled])):hover {
  background-color: var(--button-state-hover-background);
}
.a63-Button[data-variant='secondary'] {
  --button-background: color-mix(in oklch, var(--a63-action-neutral) 10%, transparent);
  --button-border-color: transparent;
}
.a63-Button[data-size='sm'] { --button-padding-inline: var(--a63-control-padding-inline-sm); }
.a63-Button::after { content: ''; }
.a63-Button:disabled .a63-Button-label { opacity: 0.56; }
`
const variable = (token: string, type: 'COLOR' | 'FLOAT', value: unknown) =>
  ({ name: token.slice(6), token, type, values: { default: { value } } }) as never
const sync: SyncModel = {
  schemaVersion: 1,
  summary: { collections: 1, variables: 4, aliasValues: 0, skipped: 0 },
  skipped: [],
  collections: [{ name: 'Base', modes: ['default'], variables: [
    variable('--a63-action-neutral', 'COLOR', { r: 0, g: 0, b: 0, a: 1 }),
    variable('--a63-action-neutral-hover', 'COLOR', { r: 0.1, g: 0.1, b: 0.1, a: 1 }),
    variable('--a63-control-padding-inline-md', 'FLOAT', 12),
    variable('--a63-control-padding-inline-sm', 'FLOAT', 8),
  ] }],
}
const model = readRecipe({
  css, sync, anatomy: buttonAnatomy, sizes: ['sm', 'md'],
  contract: { variants: ['default', 'secondary'], sizes: ['sm', 'md', 'icon'],
    states: ['rest', 'hover', 'disabled'], defaultVariant: 'default', defaultSize: 'md' },
})
const layer = (name: string, layerName = 'Button') =>
  model.variants.find(v => v.name === name)!.layers.find(l => l.name === layerName)!

it('names variants Variant × Size × State in contract order', () => {
  expect(model.variants).toHaveLength(2 * 2 * 3)
  expect(model.variants[0].name).toBe('Variant=default, Size=sm, State=rest')
})

it('follows --button-* locals to a synced token', () => {
  expect(layer('Variant=default, Size=md, State=rest').properties.fill)
    .toEqual({ alias: '--a63-action-neutral' })
  expect(layer('Variant=default, Size=md, State=rest').properties.stroke)
    .toEqual({ alias: '--a63-action-neutral' })
})

it('applies state, variant and size rules in cascade order', () => {
  expect(layer('Variant=default, Size=md, State=hover').properties.fill)
    .toEqual({ alias: '--a63-action-neutral-hover' })
  expect(layer('Variant=default, Size=sm, State=rest').properties.paddingInline)
    .toEqual({ alias: '--a63-control-padding-inline-sm' })
})

it('reads color-mix with transparent as a composed alias, and transparent as a literal', () => {
  const root = layer('Variant=secondary, Size=md, State=rest')
  expect(root.properties.fill).toEqual({ composed: { alias: '--a63-action-neutral', opacity: 10 } })
  expect(root.properties.stroke).toEqual({ value: { r: 0, g: 0, b: 0, a: 0 } })
})

it('fades the label when disabled and keeps the anatomy in step with the recipe', () => {
  expect(layer('Variant=default, Size=md, State=disabled', 'Label').properties.opacity)
    .toEqual({ value: 0.56 })
})

it('reports what it does not read', () => {
  expect(model.skipped).toContainEqual({ what: '.a63-Button::after', reason: 'pseudo-element' })
  expect(model.skipped).toContainEqual({ what: 'Size=icon', reason: 'not in this plan (C2)' })
  expect(model.tokens).toEqual([
    '--a63-action-neutral', '--a63-action-neutral-hover',
    '--a63-control-padding-inline-md', '--a63-control-padding-inline-sm',
  ])
})
```

- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** implement per the algorithm above. Keep selector parsing in one function
  `coordinateOf(selector): Coordinate | { skip: string }` and value resolution in one function
  `resolve(name, declarations, sync): ComponentValue | 'unset'` so each is unit-sized.
- [ ] **Step 4:** run → PASS. Add one more test that runs `readRecipe` on the **real**
  `packages/ui-react/src/components/button/button.css` and the real
  `packages/styles/generated/atom63.figma-sync.json`, and asserts: 300 variants; every root
  `fill` is an alias, composed alias or the transparent literal (no `skipped`); the disabled
  label opacity is `0.56`. This is the drift guard between anatomy and recipe.
- [ ] **Step 5:** `git commit -m "feat(figma): read the Button recipe into a component model"`

### Task 4: Generated model with `--check`

**Files:** Create `scripts/generate-components.mjs`, `generated/atom63.figma-components.json`;
Modify `package.json` (scripts `generate:components`, `check:components`), the CI job that runs
`check:figma` (add `check:components` next to it).

- [ ] **Step 1:** the script imports `readRecipe` from `dist/index.js` (the package builds
  before tests already), `buttonContract` from `@atom63/ui-foundation`, reads `button.css` and
  `atom63.figma-sync.json`, writes the JSON with a trailing newline. `--check` exits 1 with
  `generated/atom63.figma-components.json is stale; run pnpm --filter @atom63/figma generate:components`
  when the output differs.
- [ ] **Step 2:** run it, inspect `literals` and `skipped` by hand; every entry must have a
  reason a reviewer accepts. Paste the counts into the PR description.
- [ ] **Step 3:** `pnpm --filter @atom63/figma check:components` → exit 0; edit one byte of the
  JSON → exit 1; restore.
- [ ] **Step 4:** `git commit -m "feat(figma): generate the Button component model"`

### Task 5: `NodesApi` and the fake

**Files:** Create `src/components/nodes-api.ts`, `test/fake-nodes.ts`

**Interfaces — Produces:**

```ts
export interface PaintLike { type: 'SOLID'; color: { r: number; g: number; b: number }; opacity?: number;
  boundVariables?: { color?: { type: 'VARIABLE_ALIAS'; id: string } } }
export interface EffectLike { type: 'DROP_SHADOW'; color: { r: number; g: number; b: number; a: number };
  offset: { x: number; y: number }; radius: number; spread: number; visible: boolean;
  blendMode: 'NORMAL'; boundVariables?: Record<string, { type: 'VARIABLE_ALIAS'; id: string }> }

export interface SceneNodeLike {
  id: string
  name: string
  type: 'FRAME' | 'TEXT' | 'COMPONENT' | 'COMPONENT_SET'
  parent: SceneNodeLike | PageLike | null
  children?: SceneNodeLike[]
  visible: boolean
  opacity: number
  fills: PaintLike[]
  strokes: PaintLike[]
  effects: EffectLike[]
  boundVariables?: Record<string, { type: 'VARIABLE_ALIAS'; id: string }>
  setBoundVariable(field: string, variable: VariableLike | null): void
  appendChild(child: SceneNodeLike): void
  remove(): void
  // frame / component
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
  // text
  characters?: string
  fontName?: { family: string; style: string }
}

export interface PageLike { id: string; name: string; children: SceneNodeLike[];
  appendChild(child: SceneNodeLike): void; loadAsync(): Promise<void> }

export interface NodesApi extends StylesApi {
  root: { children: PageLike[] }
  createPage(): PageLike
  createFrame(): SceneNodeLike
  createText(): SceneNodeLike
  createComponent(): SceneNodeLike
  combineAsVariants(nodes: SceneNodeLike[], parent: PageLike): SceneNodeLike
  variables: VariablesApi & {
    setBoundVariableForPaint(paint: PaintLike, field: 'color', variable: VariableLike): PaintLike
    setBoundVariableForEffect(effect: EffectLike, field: string, variable: VariableLike): EffectLike
  }
}
```

- [ ] **Step 1:** write `fake-nodes.ts` extending `createFakeFigma()` (reuse its variables and
  styles) with an in-memory tree: incrementing ids, `appendChild` reparents, `remove` detaches,
  `combineAsVariants` wraps components in a `COMPONENT_SET`, `setBoundVariable` records
  `{ type: 'VARIABLE_ALIAS', id }` under `boundVariables[field]`, the two paint/effect helpers
  return copies with `boundVariables` set. Count every mutating call in `fake.writes` so tests
  can assert a second run writes nothing.
- [ ] **Step 2:** a smoke test in `test/sync-component.test.ts` creates a page and a component
  through the fake and reads them back.
- [ ] **Step 3:** `git commit -m "test(figma): in-memory Figma node fake"`

### Task 6: `syncComponent` — plan, apply, verify

**Files:** Create `src/components/sync-component.ts`; extend `test/sync-component.test.ts`

**Interfaces:**
- Consumes: `ComponentModel` (Task 2), `NodesApi` (Task 5), the code-syntax lookup used by
  `style-sync.ts` (`variablesOf` → `byToken`; export it from `style-sync.ts` rather than copying).
- Produces:

```ts
export interface ComponentPlan {
  missingVariables: string[]   // C8: non-empty → nothing is written
  create: string[]             // variant names (and 'page', 'set') that do not exist yet
  update: string[]             // variant names whose layers or bindings differ
  unchanged: number
}
export interface ComponentResult { created: number; updated: number; fontFallbacks: string[] }
export async function planComponent(figma: NodesApi, model: ComponentModel, only?: string[]): Promise<ComponentPlan>
export async function applyComponent(figma: NodesApi, model: ComponentModel, only?: string[]): Promise<ComponentResult>
export async function syncComponent(figma: NodesApi, model: ComponentModel, only?: string[]):
  Promise<{ planned: ComponentPlan; applied: ComponentResult; verification: ComponentPlan }>
```

`only` limits the run to some variant names, so one script can carry one slice (Task 7).

**Apply rules:**

- Page `model.page` by name, created at the end if missing; `await page.loadAsync()`.
- Component set by name on that page. When missing, build all variants of this run as
  components, `combineAsVariants`, name the set. When present, add missing variants with
  `set.appendChild`; never delete variants or layers that the model does not list.
- Root layer: auto layout `HORIZONTAL`, `primaryAxisAlignItems: 'CENTER'`,
  `counterAxisAlignItems: 'CENTER'`, `counterAxisSizingMode: 'FIXED'`, `primaryAxisSizingMode: 'AUTO'`.
  Children in order `Icon`, `Label`, `Spinner`; `Icon` visibility bound to the `Icon` boolean
  property, `Label.characters` to the `Label` text property.
- Each `ComponentValue`: `{ alias }` → bind (`setBoundVariable` for numbers,
  `setBoundVariableForPaint` for paints); `{ composed }` → bound paint with
  `opacity = composed.opacity / 100`; `{ value }` → write the literal and clear any binding;
  `{ skipped }` → leave the property alone. `paddingInline` writes `paddingLeft` and
  `paddingRight`. `focusRing` + `focusRingWidth` → one `DROP_SHADOW` (C6), only in
  `State=focusVisible`.
- Text: `loadFontAsync` the family/style from the model's font token (fallback `Inter Regular`,
  reported in `fontFallbacks`, as `style-sync.ts` does).
- Layout of the set: a grid, rows = `Variant × Size`, columns = `State`, 24 px gaps, only when
  the set is created (a designer's later arrangement is kept).

- [ ] **Step 1: Write the failing tests**

```ts
it('refuses to write when a bound token has no variable', async () => {
  const fake = createFakeNodes()
  const result = await syncComponent(fake.figma, buttonModelFixture)
  expect(result.planned.missingVariables).toContain('--a63-action-neutral')
  expect(fake.writes).toBe(0)
})

it('builds the set, binds by code syntax, and a second run writes nothing', async () => {
  const fake = createFakeNodes()
  await syncModel(fake.figma, syncFixture)          // variables first, as in real use
  const first = await syncComponent(fake.figma, buttonModelFixture)
  expect(first.verification).toEqual({ missingVariables: [], create: [], update: [], unchanged: 12 })
  const root = fake.findVariant('Button', 'Variant=default, Size=md, State=rest')
  expect(root.fills[0].boundVariables?.color?.id).toBe(fake.variableOf('--a63-action-neutral').id)
  expect(root.boundVariables?.paddingLeft?.id).toBe(fake.variableOf('--a63-control-padding-inline-md').id)

  const writes = fake.writes
  const second = await syncComponent(fake.figma, buttonModelFixture)
  expect(second.planned).toEqual({ missingVariables: [], create: [], update: [], unchanged: 12 })
  expect(fake.writes).toBe(writes)
})

it('keeps layers a designer added and variants it does not list', async () => {
  const fake = createFakeNodes()
  await syncModel(fake.figma, syncFixture)
  await syncComponent(fake.figma, buttonModelFixture)
  const root = fake.findVariant('Button', 'Variant=default, Size=md, State=rest')
  const note = fake.figma.createFrame(); note.name = 'Designer note'; root.appendChild(note)
  await syncComponent(fake.figma, buttonModelFixture)
  expect(root.children!.map(c => c.name)).toContain('Designer note')
})

it('draws the focus ring as a bound drop shadow only on focusVisible', async () => { /* … */ })
it('uses a composed paint for color-mix values', async () => { /* … */ })
```

  (`buttonModelFixture` and `syncFixture` are the Task 3 inline fixtures, exported from
  `test/fixtures/button.ts`. Write the two elided tests in full with the same pattern before
  implementing.)
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** implement plan first (read-only diff of desired vs. actual per variant), then
  apply as "for each planned create/update, write", then `syncComponent = plan → apply → plan`.
- [ ] **Step 4:** run → PASS.
- [ ] **Step 5:** `git commit -m "feat(figma): sync a component set bound to the token variables"`

### Task 7: Scripts, runtime and CLI

**Files:** Create `src/components/scripts.ts`, `test/component-scripts.test.ts`;
Modify `src/runtime.ts`, `src/cli.ts`, `src/index.ts`, `README.md`

- [ ] **Step 1: Failing test**

```ts
it('splits the model into scripts under the limit, one Variant per script', () => {
  const scripts = buildComponentScripts(realButtonModel, 'sync')
  expect(scripts).toHaveLength(10)
  for (const script of scripts) expect(script.length).toBeLessThan(49_000)
})

it('runs every script in order against the fake and verifies clean', async () => {
  const fake = createFakeNodes()
  for (const script of buildScripts(realSyncModel, 'sync')) await fake.run(script)
  for (const script of buildComponentScripts(realButtonModel, 'sync')) {
    const result = await fake.run(script) as { verification: ComponentPlan }
    expect(result.verification.create).toEqual([])
    expect(result.verification.update).toEqual([])
    expect(JSON.stringify(result).length).toBeLessThan(20_000)
  }
  for (const script of buildComponentScripts(realButtonModel, 'check'))
    expect(((await fake.run(script)) as { planned: ComponentPlan }).planned.unchanged).toBe(30)
})
```

- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** `runtime.ts` exports `syncComponentPart(figma, model, only)` and
  `checkComponentPart(…)`; `scripts.ts` wraps them like `wrap()` in `src/scripts.ts`, passing the
  model trimmed to the variants of one `Variant` value (if a slice still exceeds the limit, split
  it by `Size`). `cli.ts` adds
  `atom63-figma components --model generated/atom63.figma-components.json --out <dir>` writing
  `components-N.js` and `components-check-N.js`, and prints `tokens`, `literals` and `skipped`
  counts like `sync` does.
- [ ] **Step 4:** run → PASS; `pnpm --filter @atom63/figma build && pnpm --filter @atom63/figma test`.
- [ ] **Step 5:** README: a "Components" section after "Sync code to Figma": run the token sync
  first, then `components`, then each script with `use_figma`; every `verification` must plan no
  `create` or `update`; `missingVariables` means sync the tokens again.
- [ ] **Step 6:** `pnpm changeset` (`@atom63/figma` minor: "Generates the Button component set,
  bound to the token variables"), commit
  `feat(figma): component scripts and the components command`.

### Task 8: Real-Figma run and docs

No code; this is the acceptance gate.

- [ ] In a new Figma file: run the token sync scripts, then the component scripts, through the
  Figma MCP server's `use_figma`. Every result reports `verification` with no `create`/`update`.
- [ ] Run all `components-check-N.js`; every one reports `unchanged: 30`.
- [ ] Switch the `Theme` collection mode on the `Components` page (modern-light → aqua-dark):
  the buttons restyle, which proves the bindings. Screenshot with `get_screenshot` for the PR.
- [ ] Rename one variant's `Label` layer text and add a layer; run the sync again: the added
  layer stays, `verification` is clean.
- [ ] Update [figma-token-sync-spec.md](./figma-token-sync-spec.md): D6 gains "Button is
  generated by figma-components-plan-1"; "Out of scope" keeps Code Connect, other components,
  icon/tile sizes and box shadows.

## Later plans (not in this one)

- Icon and tile sizes (their own anatomy), then the next components by reuse of the anatomy
  shape: Badge, Input, Checkbox, Switch.
- Box shadows bound to `Shadow/<step>` effect styles.
- Code Connect from the component set to `@atom63/ui-react` `Button`.
- A plugin entry, if the spec's plugin scope is widened.
