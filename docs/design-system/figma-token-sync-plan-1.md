# Figma token sync, plan 1: the `@atom63/figma` package and agent sync

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** An agent can sync a project's token CSS (or Atom63's token set) into a Figma file
through the Figma MCP server, confirm it is in sync, and bring Figma edits back into code.

**Architecture:** The sync engine and CSS parser move out of the plugin into a new published
package, `@atom63/figma`. Variables are matched to tokens by their web code syntax instead of
plugin data, so variables an agent writes through MCP are recognized. The package builds the
engine into a small runtime that is inlined into `use_figma` scripts, each under 50,000
characters, and a CLI, `atom63-figma`, writes those scripts and turns what Figma returns into a
change list.

**Tech Stack:** TypeScript, tsup (ESM library plus an IIFE runtime), Vitest, Node's `parseArgs`,
the Figma Plugin API as used by the Figma MCP server's `use_figma` tool.

**Spec:** [figma-token-sync-spec.md](./figma-token-sync-spec.md). This plan covers the
architecture's package, the Code to Figma and Figma to Code flows, identity by code syntax, and
names without a prefix. Later plans cover text and effect styles (plan 2), the rebuilt plugin
(plan 3) and the site template's wiring (plan 4).

**One change from the spec:** the spec puts the agent commands in `atom63 mcp`. `@atom63/cli` is
private and is not published, so a project started from the template could not install it. The
commands ship in `@atom63/figma` as the `atom63-figma` CLI instead, which an agent runs from the
project; MCP tools that wrap it can come later without changing the scripts.

## Global Constraints

- Code is the only source of truth; nothing writes Figma edits back to code automatically.
- Match a variable to its token by its web code syntax `var(--token)`, not by plugin data.
- Collection and variable names carry no `Atom63` or `--a63-` prefix.
- Every `use_figma` script stays under 50,000 characters.
- A sync never deletes a variable and never changes a variable without code syntax.
- Numbers compare with a tolerance relative to their size (Figma stores 32-bit floats).
- The site template takes `@atom63/figma` as a dev dependency only.
- Commits: Conventional Commit titles, English bodies that say what changed; a changeset for each
  published package that changes (`@atom63/figma`, `@atom63/styles`).

## Review Focus

- **A token set bigger than one script** (Atom63: 1,009 variables): every script must stay under
  50,000 characters and an alias may point at a variable written by an earlier script. Pinned in
  Task 4.
- **A file first synced by the old plugin** (variables with plugin data and names but no code
  syntax): the sync must adopt them by name and write their code syntax, not duplicate them.
  Pinned in Task 2.
- **A variable a designer made in Figma** (no code syntax): sync must leave it untouched and the
  diff must list it as a proposed token, not report it as orphaned. Pinned in Tasks 2 and 5.
- **A token the Node CLI cannot compute** (a relative color such as `oklch(from var(--x) …)`,
  which the plugin computed with the browser): the CLI must report it as not synced, with the
  reason, and still write every other token. Pinned in Task 6.
- **Running the same scripts twice**: the second run must plan zero creates and zero updates.
  Pinned in Tasks 4 and 7.

---

## File structure

| File                                                                                                                  | Responsibility                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `packages/figma/package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `eslint.config.js`, `README.md` | The package, its build (library and runtime), tests and the agent guide                                                             |
| `packages/figma/src/plan.ts`                                                                                          | Token set types (`SyncModel`), `planSync`, `valuesEqual` (moved from the plugin)                                                    |
| `packages/figma/src/apply.ts`                                                                                         | `readSnapshot`, `applyPlan`, identity by code syntax (moved, changed)                                                               |
| `packages/figma/src/css-model.ts`                                                                                     | Token CSS to token set (moved)                                                                                                      |
| `packages/figma/src/css-files.ts`                                                                                     | Read a token directory in `index.css` import order                                                                                  |
| `packages/figma/src/diff.ts`                                                                                          | Figma state vs code: changed values, proposed tokens, missing tokens, and the change list text (from the plugin's `change-list.ts`) |
| `packages/figma/src/pack.ts`                                                                                          | Compact encoding of a token set for scripts, and its decoder                                                                        |
| `packages/figma/src/runtime.ts`                                                                                       | What runs inside Figma: `sync`, `check`, `read` over `figma.variables`                                                              |
| `packages/figma/src/scripts.ts`                                                                                       | Split a token set into ordered chunks and wrap each in the runtime                                                                  |
| `packages/figma/src/cli.ts`                                                                                           | `atom63-figma sync`, `check`, `read`, `diff`                                                                                        |
| `packages/figma/src/index.ts`                                                                                         | Public exports                                                                                                                      |
| `packages/figma/test/fake-api.ts`, `test/fake-figma.ts`                                                               | In-memory `figma.variables`, and a `figma` global that runs scripts                                                                 |
| `apps/figma-plugin/src/**`                                                                                            | Imports the engine from `@atom63/figma`                                                                                             |
| `packages/styles/scripts/generate-figma-sync.mjs` and its rules                                                       | Collection names without the `Atom63` prefix                                                                                        |

---

### Task 1: Create `@atom63/figma` and move the engine into it

**Files:**

- Create: `packages/figma/package.json`, `packages/figma/tsconfig.json`,
  `packages/figma/tsup.config.ts`, `packages/figma/vitest.config.ts`,
  `packages/figma/eslint.config.js`, `packages/figma/src/index.ts`
- Move (`git mv`): `apps/figma-plugin/src/sync/{plan,apply,css-model,change-list}.ts` to
  `packages/figma/src/`; `apps/figma-plugin/test/fake-api.ts` to `packages/figma/test/`;
  `apps/figma-plugin/__tests__/{sync,project-sync}.test.ts` and
  `apps/figma-plugin/__tests__/fixtures` to `packages/figma/test/`
- Modify: `apps/figma-plugin/package.json`, `apps/figma-plugin/src/code.ts`,
  `apps/figma-plugin/src/utils/css-color.ts`, `apps/figma-plugin/src/types/messages.ts`,
  `apps/figma-plugin/src/sync/export.ts`, `apps/figma-plugin/src/pages/ProjectSync.tsx`

**Interfaces:**

- Produces: `@atom63/figma` exporting everything the four moved modules export today
  (`planSync`, `valuesEqual`, `metadataDiffers`, the `Sync*` and `Snapshot*` types, `readSnapshot`,
  `applyPlan`, `VariablesApi`, `VariableLike`, `CollectionLike`, `RawValue`, `buildProjectModel`,
  `parseColor`, `evaluateNumber`, `variableName`, `CssFile`, `ProjectModel`, `TokenSource`,
  `ColorResolver`, `planChangeList`, `formatChangeList`, `formatValue`, `ProjectChange`).

- [ ] **Step 1: Write the package files**

`packages/figma/package.json`:

```json
{
  "name": "@atom63/figma",
  "version": "0.1.0-beta.0",
  "description": "Sync design tokens between code and Figma variables: the sync engine, a token CSS reader, and scripts an agent runs through the Figma MCP server",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/atom63/atom63-design-system.git",
    "directory": "packages/figma"
  },
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "@atom63/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --cache --max-warnings 0",
    "test": "vitest run"
  },
  "devDependencies": {
    "@atom63/eslint-config": "workspace:*",
    "@atom63/tsconfig": "workspace:*",
    "@figma/plugin-typings": "<copy the version from apps/figma-plugin/package.json>",
    "@types/node": "^26.3.0",
    "eslint": "10.7.0",
    "tsup": "^8.3.5",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

`packages/figma/tsconfig.json`:

```json
{
  "extends": "@atom63/tsconfig/node.json",
  "compilerOptions": {
    "types": ["node"]
  },
  "include": ["src", "test"]
}
```

`packages/figma/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
})
```

`packages/figma/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

export default defineConfig({
  test: { ...sharedTestOptions, environment: 'node', include: ['test/**/*.test.ts'] },
})
```

`packages/figma/eslint.config.js`:

```js
import { node } from '@atom63/eslint-config/node'

/* @atom63/figma: the token sync engine, CLI and Figma runtime. No React. */
export default node({ tsconfigRootDir: import.meta.dirname })
```

- [ ] **Step 2: Move the engine, its fake API, its tests and fixtures**

```bash
mkdir -p packages/figma/src packages/figma/test
git mv apps/figma-plugin/src/sync/plan.ts apps/figma-plugin/src/sync/apply.ts \
  apps/figma-plugin/src/sync/css-model.ts apps/figma-plugin/src/sync/change-list.ts packages/figma/src/
git mv apps/figma-plugin/test/fake-api.ts packages/figma/test/
git mv apps/figma-plugin/__tests__/sync.test.ts apps/figma-plugin/__tests__/project-sync.test.ts \
  apps/figma-plugin/__tests__/fixtures packages/figma/test/
```

Fix the relative imports in the moved tests and fake API: `../src/sync/<module>` becomes
`../src/<module>`. In `sync.test.ts` the Atom63 model path becomes
`resolve(__dirname, '../../styles/generated/atom63.figma-sync.json')`; in `project-sync.test.ts`
the fixture path becomes `resolve(__dirname, 'fixtures/project-tokens')`.

- [ ] **Step 3: Write `packages/figma/src/index.ts`**

```ts
export * from './apply'
export * from './change-list'
export * from './css-model'
export * from './plan'
```

- [ ] **Step 4: Run the moved tests in the new package**

Run: `pnpm install && pnpm --filter @atom63/figma test`
Expected: PASS, the same 31 tests that passed in the plugin.

- [ ] **Step 5: Point the plugin at the package**

Add `"@atom63/figma": "workspace:*"` to `dependencies` in `apps/figma-plugin/package.json`. Replace
every import of `./sync/plan`, `./sync/apply`, `./sync/css-model`, `./sync/change-list`,
`../sync/css-model` and `../sync/plan` with `@atom63/figma` in `src/code.ts`,
`src/utils/css-color.ts`, `src/types/messages.ts`, `src/pages/ProjectSync.tsx`; in
`src/sync/export.ts` replace `from './plan'` with `from '@atom63/figma'`. The plugin has no tests
left after the move, and `vitest run` fails when it finds none, so delete the plugin's `test`
script and its `vitest.config.*` (plan 3 adds the plugin's own tests back).

- [ ] **Step 6: Verify the plugin and the package the way CI does**

Run:

```bash
rm -rf packages/figma/dist
pnpm --filter @atom63/figma typecheck && pnpm --filter @atom63/figma lint && pnpm --filter @atom63/figma build
pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin lint && pnpm --filter @atom63/figma-plugin build
```

Expected: all succeed; the plugin bundle builds from the package's sources through the
`@atom63/source` condition.

- [ ] **Step 7: Add a changeset and commit**

Run `pnpm changeset`, choose `@atom63/figma`, minor, summary: "New package: the Figma token sync
engine and token CSS reader, moved from the Cipher plugin." Then:

```bash
git add packages/figma apps/figma-plugin .changeset pnpm-lock.yaml
git commit -m "feat(figma): move the token sync engine into @atom63/figma"
```

---

### Task 2: Match variables by code syntax instead of plugin data

**Files:**

- Modify: `packages/figma/src/apply.ts`, `packages/figma/src/plan.ts` (doc comment only),
  `packages/figma/test/fake-api.ts`
- Test: `packages/figma/test/identity.test.ts`

**Interfaces:**

- Consumes: `readSnapshot(api, model)`, `applyPlan(api, model, plan)`, `planSync` from Task 1.
- Produces: `tokenOfCodeSyntax(codeSyntax: string | undefined): string | null` exported from
  `apply.ts`; `VariableLike` no longer has `getPluginData` or `setPluginData`; `TOKEN_KEY` is
  removed.

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/identity.test.ts`:

```ts
import { applyPlan, readSnapshot, tokenOfCodeSyntax, type VariablesApi } from '../src/apply'
import { planSync, type SyncModel } from '../src/plan'
import { createFakeApi } from './fake-api'

const model: SyncModel = {
  schemaVersion: 1,
  summary: { collections: 1, variables: 2, aliasValues: 1, skipped: 0 },
  skipped: [],
  collections: [
    {
      name: 'Brand',
      modes: ['b1', 'b2'],
      variables: [
        {
          name: 'brand/500',
          token: '--brand-500',
          type: 'COLOR',
          values: {
            b1: { value: { r: 0, g: 0, b: 1, a: 1 } },
            b2: { value: { r: 1, g: 0, b: 0, a: 1 } },
          },
          codeSyntax: 'var(--brand-500)',
          scopes: [],
        },
        {
          name: 'primary',
          token: '--primary',
          type: 'COLOR',
          values: { b1: { alias: '--brand-500' }, b2: { alias: '--brand-500' } },
          codeSyntax: 'var(--primary)',
          scopes: ['ALL_SCOPES'],
        },
      ],
    },
  ],
}

async function sync(api: VariablesApi) {
  const plan = planSync(model, await readSnapshot(api, model))
  await applyPlan(api, model, plan)
  return planSync(model, await readSnapshot(api, model))
}

describe('identity by code syntax', () => {
  it('reads the token from web code syntax', () => {
    expect(tokenOfCodeSyntax('var(--primary)')).toBe('--primary')
    expect(tokenOfCodeSyntax('var( --a63-surface-page )')).toBe('--a63-surface-page')
    expect(tokenOfCodeSyntax(undefined)).toBeNull()
    expect(tokenOfCodeSyntax('16px')).toBeNull()
  })

  it('recognizes variables written without plugin data', async () => {
    const { api } = createFakeApi()
    expect((await sync(api)).totals).toMatchObject({ create: 0, update: 0, unchanged: 2 })
  })

  it('keeps matching a variable a designer renamed', async () => {
    const { api, variables } = createFakeApi()
    await sync(api)
    const primary = [...variables.values()].find(item => item.name === 'primary')
    if (!primary) throw new Error('primary missing')
    primary.name = 'roles/primary'
    const plan = planSync(model, await readSnapshot(api, model))
    expect(plan.totals).toMatchObject({ create: 0, update: 1 })
    expect(plan.changes[0]).toMatchObject({ kind: 'update', rename: true })
  })

  it('adopts a variable an older sync left without code syntax, by name', async () => {
    const { api } = createFakeApi()
    const collection = api.createVariableCollection('Brand')
    collection.renameMode(collection.modes[0].modeId, 'b1')
    collection.addMode('b2')
    api.createVariable('brand/500', collection, 'COLOR')
    const after = await sync(api)
    expect(after.totals).toMatchObject({ create: 0, update: 0, unchanged: 2 })
    const snapshot = await readSnapshot(api, model)
    expect(snapshot[0].variables.filter(item => item.name === 'brand/500')).toHaveLength(1)
  })

  it('leaves a variable made in Figma alone and does not call it orphaned', async () => {
    const { api, collections } = createFakeApi()
    await sync(api)
    const made = api.createVariable('my-accent', collections[0], 'COLOR')
    made.setValueForMode(collections[0].modes[0].modeId, { r: 0, g: 1, b: 0, a: 1 })
    const plan = planSync(model, await readSnapshot(api, model))
    expect(plan.totals).toMatchObject({ create: 0, update: 0, orphaned: 0 })
    await applyPlan(api, model, plan)
    expect(made.valuesByMode[collections[0].modes[0].modeId]).toEqual({ r: 0, g: 1, b: 0, a: 1 })
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- identity`
Expected: FAIL: `tokenOfCodeSyntax` is not exported, and the fake API's variables lose their
identity without plugin data.

- [ ] **Step 3: Implement identity by code syntax in `apply.ts`**

Add, and export:

```ts
/** The token a variable stands for, from its web code syntax `var(--token)`. */
export function tokenOfCodeSyntax(codeSyntax: string | undefined): string | null {
  const match = codeSyntax?.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  return match ? match[1] : null
}

const tokenOf = (variable: VariableLike) => tokenOfCodeSyntax(variable.codeSyntax?.WEB)
```

Then, in `apply.ts`:

- Delete `TOKEN_KEY` and the `getPluginData` and `setPluginData` members of `VariableLike`.
- In `readSnapshot`, set `token: tokenOf(variable)` and resolve an alias target's token with
  `tokenOf(target) ?? \`id:${target.id}\``.
- In `applyPlan`, build the token-to-variable map with `tokenOf(variable)`; drop every
  `setPluginData` call. A created variable gets its code syntax from `writeMetadata`, which
  already runs for every create and update, so write metadata right after `createVariable`,
  before any alias to it is resolved.
- When a moved token retires its old variable, replace `setPluginData(TOKEN_KEY, '')` with
  `variable.removeVariableCodeSyntax?.('WEB')`, so the retired copy no longer matches.

In `test/fake-api.ts`, delete the `pluginData` map and its two methods, and add
`removeVariableCodeSyntax(platform) { const { [platform]: _, ...rest } = this.codeSyntax ?? {}; this.codeSyntax = rest }`.

Update the file comment at the top of `plan.ts`: variables are matched by the token in their web
code syntax, then by name inside the collection.

- [ ] **Step 4: Run all package tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS, including the moved tests (they match through code syntax now, since every model
variable carries it).

- [ ] **Step 5: Check the plugin still builds**

Run: `pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin build`
Expected: PASS. If `src/code.ts` passes plugin data methods into its `VariablesApi` wrapper, they
are now extra properties and can stay until plan 3 rebuilds the plugin.

- [ ] **Step 6: Commit**

```bash
git add packages/figma
git commit -m "feat(figma): match variables to tokens by their web code syntax"
```

---

### Task 3: Name Atom63's collections without the `Atom63` prefix

**Files:**

- Modify: `packages/styles/scripts/generate-figma-sync.mjs`,
  `packages/styles/scripts/lib/figma-sync-rules.mjs`,
  `packages/styles/scripts/lib/figma-sync-rules.test.mjs`,
  `packages/styles/scripts/generate-token-manifest.mjs`,
  `packages/styles/scripts/lib/token-patch.mjs`, `packages/styles/scripts/lib/token-patch.test.mjs`,
  `packages/styles/src/tokens/figma-parity.browser.test.ts`,
  `packages/ui-ios/Scripts/lib/theme-graph.mjs`, `packages/figma/test/sync.test.ts`
- Regenerate: `packages/styles/generated/*`, `packages/cli/generated/agent-index.json`, and the iOS
  generated graph if its generator reads collection names

**Interfaces:**

- Produces: `@atom63/styles/figma-sync.json` with collections named `Theme`, `Contract`,
  `Semantic`, `Foundation`, `Mode`, `Brand`, `Surface`, `Design Language`, `Input`, `Density`,
  `Radius`, `Type Scale`, `Font`, `Window Size`.

- [ ] **Step 1: Change the expectation first**

In `packages/figma/test/sync.test.ts`, add:

```ts
it('names collections without the Atom63 prefix', () => {
  expect(model.collections.map(collection => collection.name)).toEqual([
    'Theme',
    'Contract',
    'Semantic',
    'Foundation',
    'Mode',
    'Brand',
    'Surface',
    'Design Language',
    'Input',
    'Density',
    'Radius',
    'Type Scale',
    'Font',
    'Window Size',
  ])
})
```

Run: `pnpm --filter @atom63/figma test -- sync`
Expected: FAIL, the names start with `Atom63 `.

- [ ] **Step 2: Rename in the generator and every reader**

Run `grep -rn "Atom63 \(Theme\|Mode\|Brand\|Semantic\|Contract\|Foundation\|Surface\|Design Language\|Input\|Density\|Radius\|Type Scale\|Font\|Window Size\)" packages apps --include='*.mjs' --include='*.ts' --include='*.tsx' --include='*.swift'`
and drop the `Atom63 ` prefix at each hit in the files listed above: the collection constants in
`generate-figma-sync.mjs`, the collection keys in `figma-sync-rules.mjs` and its test, the
collection names in `generate-token-manifest.mjs`, `token-patch.mjs` and its test,
`figma-parity.browser.test.ts` and `theme-graph.mjs`. Do not touch `CHANGELOG.md` entries.

- [ ] **Step 3: Regenerate everything generated from the tokens**

```bash
pnpm --filter @atom63/styles generate:tokens
pnpm --filter @atom63/cli generate:index
```

Then run the iOS token graph generator if `git status` shows `theme-graph.mjs` feeds a generated
Swift file (its script is named in `packages/ui-ios/package.json`).

- [ ] **Step 4: Run the affected tests**

```bash
pnpm --filter @atom63/figma test
pnpm --filter @atom63/styles test
node --test packages/styles/scripts/lib/*.test.mjs
pnpm --filter @atom63/styles check:figma
```

Expected: PASS.

- [ ] **Step 5: Changeset and commit**

Run `pnpm changeset`, choose `@atom63/styles`, minor, summary: "The Figma sync model names its
collections without the `Atom63` prefix (`Mode`, `Brand`, `Surface`, …)." Then:

```bash
git add packages .changeset
git commit -m "feat(styles): name Figma sync collections without the Atom63 prefix"
```

---

### Task 4: Scripts an agent runs through `use_figma`

**Files:**

- Create: `packages/figma/src/css-files.ts`, `packages/figma/src/node.ts`, `packages/figma/src/pack.ts`,
  `packages/figma/src/runtime.ts`, `packages/figma/src/scripts.ts`,
  `packages/figma/test/fake-figma.ts`, `packages/figma/test/scripts.test.ts`
- Modify: `packages/figma/tsup.config.ts`, `packages/figma/src/index.ts`,
  `packages/figma/package.json` (`build` script)

**Interfaces:**

- Consumes: `planSync`, `readSnapshot`, `applyPlan`, `VariablesApi`, `SyncModel`,
  `SnapshotCollection` from Tasks 1 and 2.
- Produces:
  - `readTokenDirectory(directory: string): CssFile[]` (Node): the `.css` files of a directory,
    in the order its `index.css` imports them, `index.css` itself excluded.
  - `packModel(model: SyncModel): PackedModel` and `unpackModel(packed: PackedModel): SyncModel`,
    where `PackedModel = { s: string[][]; c: [name: string, modes: string[], variables: PackedVariable[]][] }`
    and `PackedVariable = [token: string, name: string, type: 'C' | 'F' | 'S', value: PackedValue | PackedValue[], scopeIndex: number]`,
    `token` without its leading `--`. A value is a number, a string, `'#rrrrggggbbbbaaaa'`
    (16-bit hex color), `'@--token'` (alias) or `'@--token*opacity'` (composed). Code syntax is
    not stored: it is always `var(<token>)`, and packing throws on a variable where it is not.
  - `buildScripts(model: SyncModel, action: 'sync' | 'check', options?: { maxLength?: number }): string[]`
    ordered so every alias target is written by the same or an earlier script; each script
    returns `{ part: number; parts: number; planned: SyncPlan['totals']; applied?: ApplyResult; verification: SyncPlan['totals'] }`.
  - `RUNTIME_SOURCE: string`: the minified IIFE that defines `A63Figma` with
    `sync(figma, model)`, `check(figma, model)` and `read(figma)`.

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/fake-figma.ts`:

```ts
import { createFakeApi } from './fake-api'

/** A `figma` global over the fake API, and a runner for `use_figma` script bodies. */
export function createFakeFigma() {
  const fake = createFakeApi()
  const figma = { variables: fake.api }
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
    ...args: string[]
  ) => (figma: unknown) => Promise<unknown>
  const run = (script: string) => new AsyncFunction('figma', script)(figma)
  return { ...fake, figma, run }
}
```

`packages/figma/test/scripts.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { packModel, unpackModel } from '../src/pack'
import type { SyncModel } from '../src/plan'
import { buildScripts } from '../src/scripts'
import { createFakeFigma } from './fake-figma'

const atom63 = JSON.parse(
  readFileSync(resolve(__dirname, '../../styles/generated/atom63.figma-sync.json'), 'utf8')
) as SyncModel
const project = buildProjectModel(
  readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens'))
).model

describe('scripts for use_figma', () => {
  it('packs and unpacks a token set without losing anything', () => {
    for (const model of [atom63, project]) {
      const back = unpackModel(packModel(model))
      expect(back.collections).toHaveLength(model.collections.length)
      back.collections.forEach((collection, index) => {
        const original = model.collections[index]
        expect(collection.modes).toEqual(original.modes)
        collection.variables.forEach((variable, position) => {
          const expected = original.variables[position]
          expect(variable.name).toBe(expected.name)
          expect(variable.token).toBe(expected.token)
          expect(variable.codeSyntax).toBe(expected.codeSyntax)
          expect(variable.scopes).toEqual(expected.scopes)
          for (const mode of original.modes) {
            const got = variable.values[mode]
            const want = expected.values[mode]
            if (want && 'value' in want && typeof want.value === 'object') {
              if (!got || !('value' in got) || typeof got.value !== 'object') throw new Error(mode)
              for (const channel of ['r', 'g', 'b', 'a'] as const)
                expect(got.value[channel]).toBeCloseTo(want.value[channel], 4)
            } else expect(got).toEqual(want)
          }
        })
      })
    }
  })

  it('keeps every script under 50,000 characters, for the whole Atom63 set', () => {
    const scripts = buildScripts(atom63, 'sync')
    expect(scripts.length).toBeGreaterThan(1)
    for (const script of scripts) expect(script.length).toBeLessThan(50_000)
  })

  it('syncs in parts, aliases across parts included, and plans nothing on a second run', async () => {
    const { run } = createFakeFigma()
    for (const script of buildScripts(atom63, 'sync'))
      expect(await run(script)).toMatchObject({ verification: { create: 0, update: 0 } })
    for (const script of buildScripts(atom63, 'check'))
      expect(await run(script)).toMatchObject({ planned: { create: 0, update: 0 } })
  })

  it('check scripts only read', async () => {
    const { run, collections } = createFakeFigma()
    for (const script of buildScripts(project, 'check'))
      expect(await run(script)).toMatchObject({ planned: { update: 0 } })
    expect(collections).toHaveLength(0)
  })

  it('reads the project token directory in import order', () => {
    const names = readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')).map(
      file => file.name
    )
    expect(names).not.toContain('index.css')
    expect(names.indexOf('palette.css')).toBeLessThan(names.indexOf('semantic.css'))
  })
})
```

If the fixture directory has no `index.css`, copy the template's
(`@import "./palette.css"; @import "./axes.css"; @import "./semantic.css"; @import "./scale.css"; @import "./theme.css";`)
into `packages/figma/test/fixtures/project-tokens/index.css`.

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- scripts`
Expected: FAIL, the modules do not exist.

- [ ] **Step 3: Implement `css-files.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { CssFile } from './css-model'

/** A token directory's CSS files, in the order its index.css imports them; later files win. */
export function readTokenDirectory(directory: string): CssFile[] {
  const names = readdirSync(directory).filter(name => name.endsWith('.css'))
  const index = names.includes('index.css')
    ? readFileSync(join(directory, 'index.css'), 'utf8')
    : ''
  const imports = [...index.matchAll(/@import\s+["'](?:\.\/)?([^"']+)["']/g)].map(match => match[1])
  const rank = (name: string) => (imports.includes(name) ? imports.indexOf(name) : imports.length)
  return names
    .filter(name => name !== 'index.css')
    .sort((left, right) => rank(left) - rank(right) || left.localeCompare(right))
    .map(name => ({ name, text: readFileSync(join(directory, name), 'utf8') }))
}
```

- [ ] **Step 4: Implement `pack.ts`**

```ts
import type { SyncModel, SyncValue, SyncVariable, SyncVariableType } from './plan'

export type PackedValue = number | string
export type PackedVariable = [
  token: string,
  name: string,
  type: 'C' | 'F' | 'S',
  value: PackedValue | PackedValue[],
  scopeIndex: number,
]
export interface PackedModel {
  /** Distinct scope lists; variables point at them by index. `null` means "leave alone". */
  s: (string[] | null)[]
  c: [name: string, modes: string[], variables: PackedVariable[]][]
}

const TYPE_CODE: Record<SyncVariableType, 'C' | 'F' | 'S'> = { COLOR: 'C', FLOAT: 'F', STRING: 'S' }
const CODE_TYPE = { C: 'COLOR', F: 'FLOAT', S: 'STRING' } as const

const hex16 = (channel: number) =>
  Math.round(Math.min(1, Math.max(0, channel)) * 65535)
    .toString(16)
    .padStart(4, '0')

function packValue(value: SyncValue): PackedValue {
  if ('alias' in value) return `@${value.alias}`
  if ('composed' in value) return `@${value.composed.alias}*${value.composed.opacity}`
  if (typeof value.value === 'object')
    return `#${[value.value.r, value.value.g, value.value.b, value.value.a].map(hex16).join('')}`
  return value.value
}

function unpackValue(packed: PackedValue, type: SyncVariableType): SyncValue {
  if (typeof packed === 'string' && packed.startsWith('@')) {
    const [alias, opacity] = packed.slice(1).split('*')
    return opacity === undefined ? { alias } : { composed: { alias, opacity: Number(opacity) } }
  }
  if (type === 'COLOR' && typeof packed === 'string' && packed.startsWith('#')) {
    const channel = (index: number) =>
      parseInt(packed.slice(1 + index * 4, 5 + index * 4), 16) / 65535
    return { value: { r: channel(0), g: channel(1), b: channel(2), a: channel(3) } }
  }
  return { value: packed }
}

export function packModel(model: SyncModel): PackedModel {
  const keys: string[] = []
  const scopeIndex = (list: string[] | undefined) => {
    const key = JSON.stringify(list ?? null)
    const found = keys.indexOf(key)
    return found >= 0 ? found : keys.push(key) - 1
  }
  const c = model.collections.map(collection => {
    const variables = collection.variables.map((variable): PackedVariable => {
      if (variable.codeSyntax !== `var(${variable.token})`)
        throw new Error(`${variable.name}: code syntax must be var(${variable.token})`)
      const values = collection.modes.map(mode => packValue(variable.values[mode]))
      const value = values.every(item => item === values[0]) ? values[0] : values
      return [
        variable.token.slice(2),
        variable.name,
        TYPE_CODE[variable.type],
        value,
        scopeIndex(variable.scopes),
      ]
    })
    return [collection.name, collection.modes, variables] as PackedModel['c'][number]
  })
  return { s: keys.map(key => JSON.parse(key) as string[] | null), c }
}

export function unpackModel(packed: PackedModel): SyncModel {
  const collections = packed.c.map(([name, modes, variables]) => ({
    name,
    modes,
    variables: variables.map(([tokenName, variableName, code, value, scope]): SyncVariable => {
      const type = CODE_TYPE[code]
      const token = `--${tokenName}`
      return {
        name: variableName,
        token,
        type,
        values: Object.fromEntries(
          modes.map((mode, index) => [
            mode,
            unpackValue(Array.isArray(value) ? value[index] : value, type),
          ])
        ),
        codeSyntax: `var(${token})`,
        scopes: packed.s[scope] ?? undefined,
      }
    }),
  }))
  const variables = collections.reduce((total, item) => total + item.variables.length, 0)
  return {
    schemaVersion: 1,
    summary: { collections: collections.length, variables, aliasValues: 0, skipped: 0 },
    collections,
    skipped: [],
  }
}
```

- [ ] **Step 5: Implement `runtime.ts`**

```ts
/**
 * What runs inside Figma, in a use_figma script: `figma.variables` is the
 * VariablesApi, so the engine runs unchanged. Built into an IIFE (A63Figma).
 */
import { applyPlan, readSnapshot, type VariablesApi } from './apply'
import { unpackModel, type PackedModel } from './pack'
import { planSync, type SyncModel } from './plan'

interface FigmaLike {
  variables: VariablesApi
}

const api = (figma: FigmaLike): VariablesApi => figma.variables

export async function sync(figma: FigmaLike, packed: PackedModel) {
  const model = unpackModel(packed)
  const plan = planSync(model, await readSnapshot(api(figma), model))
  const applied = await applyPlan(api(figma), model, plan)
  const after = planSync(model, await readSnapshot(api(figma), model))
  return { planned: plan.totals, applied, verification: after.totals }
}

export async function check(figma: FigmaLike, packed: PackedModel) {
  const model: SyncModel = unpackModel(packed)
  const plan = planSync(model, await readSnapshot(api(figma), model))
  return { planned: plan.totals, verification: plan.totals }
}
```

`read` is added in Task 5.

- [ ] **Step 6: Build the runtime as a string the library can inline**

The runtime is built first as a minified IIFE, then embedded as a string constant that the
library (built second) imports.

Create `packages/figma/scripts/embed-runtime.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'

const source = readFileSync(new URL('../dist/runtime/runtime.global.js', import.meta.url), 'utf8')
writeFileSync(
  new URL('../src/runtime-source.generated.ts', import.meta.url),
  `// Generated by scripts/embed-runtime.mjs from src/runtime.ts. Do not edit.\n` +
    `export const RUNTIME_SOURCE = ${JSON.stringify(source)}\n`
)
```

Set the scripts in `package.json`:

```json
"build:runtime": "tsup src/runtime.ts --format iife --global-name A63Figma --minify --platform neutral --target es2020 --out-dir dist/runtime --no-dts && node scripts/embed-runtime.mjs",
"build": "pnpm build:runtime && tsup",
"pretest": "pnpm build:runtime"
```

`tsup.config.ts` stays the library config from Task 1. Commit
`src/runtime-source.generated.ts`, so the plugin and type checks do not need a build first, and
add it to the package's Prettier and ESLint ignores.

- [ ] **Step 7: Implement `scripts.ts`**

```ts
import { packModel } from './pack'
import type { SyncModel, SyncVariable } from './plan'
import { RUNTIME_SOURCE } from './runtime-source.generated'

const LIMIT = 50_000

/** Aliases a variable depends on (literal values have none). */
function targets(variable: SyncVariable): string[] {
  return Object.values(variable.values).flatMap(value =>
    'alias' in value ? [value.alias] : 'composed' in value ? [value.composed.alias] : []
  )
}

/** Variables ordered so every alias target comes first. */
function ordered(model: SyncModel) {
  const entries = model.collections.flatMap(collection =>
    collection.variables.map(variable => ({ collection: collection.name, variable }))
  )
  const byToken = new Map(entries.map(entry => [entry.variable.token, entry]))
  const done = new Set<string>()
  const out: typeof entries = []
  const visit = (entry: (typeof entries)[number]) => {
    if (done.has(entry.variable.token)) return
    done.add(entry.variable.token)
    for (const target of targets(entry.variable)) {
      const next = byToken.get(target)
      if (next) visit(next)
    }
    out.push(entry)
  }
  entries.forEach(visit)
  return out
}

function modelOf(model: SyncModel, entries: ReturnType<typeof ordered>): SyncModel {
  return {
    ...model,
    // Every collection travels in every part, so modes exist before any value is written.
    collections: model.collections.map(collection => ({
      ...collection,
      variables: entries
        .filter(entry => entry.collection === collection.name)
        .map(entry => entry.variable),
    })),
  }
}

function wrap(model: SyncModel, action: 'sync' | 'check', part: number, parts: number) {
  const payload = JSON.stringify(packModel(model))
  return `${RUNTIME_SOURCE}\nconst result = await A63Figma.${action}(figma, ${payload});\nreturn { part: ${part}, parts: ${parts}, ...result };`
}

export function buildScripts(
  model: SyncModel,
  action: 'sync' | 'check',
  { maxLength = LIMIT }: { maxLength?: number } = {}
): string[] {
  const entries = ordered(model)
  const groups: (typeof entries)[] = []
  let current: typeof entries = []
  for (const entry of entries) {
    const next = [...current, entry]
    if (current.length > 0 && wrap(modelOf(model, next), action, 0, 0).length >= maxLength - 64) {
      groups.push(current)
      current = [entry]
    } else current = next
  }
  if (current.length > 0) groups.push(current)
  return groups.map((group, index) => wrap(modelOf(model, group), action, index + 1, groups.length))
}
```

Growing `next` one entry at a time and re-serializing is quadratic; if the Atom63 test takes over
a few seconds, estimate each entry's packed length once (`JSON.stringify` of its packed tuple plus
a comma) and add lengths instead of re-wrapping.

Export `buildScripts`, `packModel`, `unpackModel` and the packed types from `index.ts`, which
must stay free of Node imports because the runtime and the plugin bundle it. Create
`src/node.ts` with `export { readTokenDirectory } from './css-files'` for Node callers; Task 6
publishes it as `@atom63/figma/node`.

- [ ] **Step 8: Run the tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add packages/figma
git commit -m "feat(figma): build use_figma sync scripts under the size limit"
```

---

### Task 5: Read a Figma file and compare it with code

**Files:**

- Create: `packages/figma/src/diff.ts`, `packages/figma/test/diff.test.ts`
- Delete: `packages/figma/src/change-list.ts` (its code moves into `diff.ts`)
- Modify: `packages/figma/src/runtime.ts`, `packages/figma/src/scripts.ts`,
  `packages/figma/src/index.ts`, `packages/figma/test/project-sync.test.ts` (imports),
  `apps/figma-plugin/src/code.ts` (imports)

**Interfaces:**

- Consumes: `readSnapshot`, `SnapshotCollection`, `valuesEqual`, `ProjectModel`, `TokenSource`,
  `RUNTIME_SOURCE`.
- Produces:
  - Runtime `read(figma): Promise<SnapshotCollection[]>`: every local collection, every variable,
    with `token` from code syntax (null when it has none) and alias values resolved to tokens.
  - `buildReadScript(): string`.
  - `diffTokens(project: ProjectModel, figma: SnapshotCollection[]): TokenDiff`, where
    `TokenDiff = { changed: ProjectChange[]; proposed: { collection: string; name: string; values: Record<string, SyncValue | undefined> }[]; missing: { token: string; collection: string }[] }`.
  - `formatDiff(diff: TokenDiff): string` (the change list text; `formatChangeList` and
    `planChangeList` keep working, re-exported from `diff.ts`, until plan 3 removes the plugin's
    use of them).

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/diff.test.ts`:

```ts
import { resolve } from 'node:path'

import { applyPlan, readSnapshot } from '../src/apply'
import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { diffTokens, formatDiff } from '../src/diff'
import { planSync } from '../src/plan'
import { buildReadScript } from '../src/scripts'
import { createFakeFigma } from './fake-figma'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))

async function synced() {
  const fake = createFakeFigma()
  const plan = planSync(project.model, await readSnapshot(fake.api, project.model))
  await applyPlan(fake.api, project.model, plan)
  return fake
}

describe('Figma to code', () => {
  it('finds nothing right after a sync', async () => {
    const { run } = await synced()
    const figma = (await run(buildReadScript())) as Awaited<ReturnType<typeof readSnapshot>>
    const diff = diffTokens(project, figma)
    expect(diff).toEqual({ changed: [], proposed: [], missing: [] })
    expect(formatDiff(diff)).toBe('')
  })

  it('lists an edited value with its file and selector', async () => {
    const { run, variables, collections } = await synced()
    const radius = [...variables.values()].find(item => item.codeSyntax?.WEB === 'var(--radius)')
    if (!radius) throw new Error('--radius missing')
    const collection = collections.find(item => item.variableIds.includes(radius.id))
    if (!collection) throw new Error('collection missing')
    radius.setValueForMode(collection.modes[0].modeId, 6)
    const diff = diffTokens(project, (await run(buildReadScript())) as never)
    expect(diff.changed).toHaveLength(1)
    expect(diff.changed[0]).toMatchObject({ token: '--radius', to: { value: 6 } })
    expect(formatDiff(diff)).toContain('`--radius`')
  })

  it('lists a variable made in Figma as a proposed token', async () => {
    const { run, api, collections } = await synced()
    const made = api.createVariable('my-accent', collections[0], 'COLOR')
    made.setValueForMode(collections[0].modes[0].modeId, { r: 0, g: 1, b: 0, a: 1 })
    const diff = diffTokens(project, (await run(buildReadScript())) as never)
    expect(diff.proposed).toEqual([
      expect.objectContaining({ collection: collections[0].name, name: 'my-accent' }),
    ])
    expect(formatDiff(diff)).toContain('my-accent')
  })

  it('lists tokens the file does not have', async () => {
    const { run } = createFakeFigma()
    const diff = diffTokens(project, (await run(buildReadScript())) as never)
    expect(diff.missing.length).toBe(project.model.summary.variables)
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- diff`
Expected: FAIL, the modules do not exist.

- [ ] **Step 3: Add `read` to the runtime**

`readSnapshot(api, model)` only reads the model's collections. Add a model-free reader in
`apply.ts`:

```ts
/** Every local collection and variable, for comparing a file with code. */
export async function readDocument(api: VariablesApi): Promise<SnapshotCollection[]> {
  const names = (await api.getLocalVariableCollectionsAsync()).map(item => item.name)
  const everything: SyncModel = {
    schemaVersion: 1,
    summary: { collections: names.length, variables: 0, aliasValues: 0, skipped: 0 },
    skipped: [],
    // readSnapshot reads modes and variables from the document; the model only names collections.
    collections: names.map(name => ({ name, modes: [], variables: [] })),
  }
  return readSnapshot(api, everything)
}
```

and in `runtime.ts`:

```ts
export async function read(figma: FigmaLike) {
  return readDocument(api(figma))
}
```

In `scripts.ts`:

```ts
export function buildReadScript(): string {
  return `${RUNTIME_SOURCE}\nreturn await A63Figma.read(figma);`
}
```

Rebuild the runtime (`pnpm --filter @atom63/figma build`) so `read` is in `RUNTIME_SOURCE`.

- [ ] **Step 4: Implement `diff.ts`**

Move the contents of `change-list.ts` into `diff.ts` (keep `ProjectChange`, `planChangeList`,
`formatValue`, `formatChangeList` as they are), then add:

```ts
export interface TokenDiff {
  changed: ProjectChange[]
  proposed: { collection: string; name: string; values: Record<string, SyncValue | undefined> }[]
  missing: { token: string; collection: string }[]
}

export function diffTokens(project: ProjectModel, figma: SnapshotCollection[]): TokenDiff {
  const tokensInFigma = new Set(
    figma.flatMap(collection => collection.variables.map(variable => variable.token))
  )
  return {
    changed: planChangeList(project, figma),
    proposed: figma.flatMap(collection =>
      collection.variables
        .filter(variable => variable.token === null)
        .map(variable => ({
          collection: collection.name,
          name: variable.name,
          values: variable.values,
        }))
    ),
    missing: project.model.collections.flatMap(collection =>
      collection.variables
        .filter(variable => !tokensInFigma.has(variable.token))
        .map(variable => ({ token: variable.token, collection: collection.name }))
    ),
  }
}

export function formatDiff(diff: TokenDiff): string {
  const parts = [formatChangeList(diff.changed).trimEnd()].filter(Boolean)
  if (diff.proposed.length > 0)
    parts.push(
      [
        '## Variables made in Figma',
        '',
        'These have no token in code. Add a token for each one the design keeps, then sync.',
        '',
        ...diff.proposed.map(
          item =>
            `- ${item.collection} / \`${item.name}\`: ${Object.entries(item.values)
              .map(([mode, value]) => `${mode} \`${formatValue(value)}\``)
              .join(', ')}`
        ),
      ].join('\n')
    )
  if (diff.missing.length > 0)
    parts.push(
      `## Not in Figma yet\n\n${diff.missing.length} tokens are missing from the file. Run the sync scripts.`
    )
  return parts.length > 0 ? `${parts.join('\n\n')}\n` : ''
}
```

`planChangeList` matches Figma variables by token inside the same collection; make it match by
token across all collections, since a designer can move a variable between groups but not
between collections, and a token matched in the wrong collection is still the same token:
build `byToken` once from every collection of `figma` instead of per collection.

Update imports of `./change-list` to `./diff` in `index.ts`, `test/project-sync.test.ts`, and the
plugin's `src/code.ts` (which imports from `@atom63/figma`, so only `index.ts` matters there).

- [ ] **Step 5: Run the tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/figma apps/figma-plugin
git commit -m "feat(figma): read a Figma file and diff it against the code tokens"
```

---

### Task 6: The `atom63-figma` CLI

**Files:**

- Create: `packages/figma/src/cli.ts`, `packages/figma/test/cli.test.ts`
- Modify: `packages/figma/package.json` (`bin`, `exports["./node"]`), `packages/figma/tsup.config.ts`
  (add `src/cli.ts` and `src/node.ts` entries), `packages/figma/src/css-model.ts` (Node color
  resolver behaviour)

**Interfaces:**

- Consumes: `readTokenDirectory`, `buildProjectModel`, `buildScripts`, `buildReadScript`,
  `diffTokens`, `formatDiff`.
- Produces: the `atom63-figma` binary:
  - `atom63-figma sync --tokens <dir> | --model <json> --out <dir>`: writes
    `sync-1.js … sync-N.js` and `check-1.js … check-N.js`, prints a JSON summary
    `{ scripts: string[], checks: string[], variables: number, skipped: { token, reason }[] }`.
  - `atom63-figma read --out <file>`: writes the read script.
  - `atom63-figma diff --tokens <dir> --figma <read-result.json>`: prints the change list
    (empty output and exit code 0 when Figma matches code).
  - Exit code 1 with a one-line message on a missing or unreadable input.

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/cli.test.ts`:

```ts
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { createFakeFigma } from './fake-figma'

const cli = resolve(__dirname, '../dist/cli.js')
const tokens = resolve(__dirname, 'fixtures/project-tokens')
const run = (...args: string[]) => execFileSync('node', [cli, ...args], { encoding: 'utf8' })

describe('atom63-figma', () => {
  it('writes sync and check scripts, and the sync scripts bring Figma in line', async () => {
    const out = mkdtempSync(join(tmpdir(), 'figma-'))
    const summary = JSON.parse(run('sync', '--tokens', tokens, '--out', out)) as {
      scripts: string[]
      checks: string[]
    }
    expect(readdirSync(out).sort()).toEqual([...summary.checks, ...summary.scripts].sort())
    const { run: execute } = createFakeFigma()
    for (const file of summary.scripts)
      expect(await execute(readFileSync(join(out, file), 'utf8'))).toMatchObject({
        verification: { create: 0, update: 0 },
      })
  })

  it('reports a relative color it cannot compute, and syncs the rest', () => {
    const out = mkdtempSync(join(tmpdir(), 'figma-'))
    const dir = mkdtempSync(join(tmpdir(), 'tokens-'))
    writeFileSync(
      join(dir, 'tokens.css'),
      ':root { --blue: #2563eb; --on-blue: oklch(from var(--blue) 0.98 0.01 h); }'
    )
    const summary = JSON.parse(run('sync', '--tokens', dir, '--out', out)) as {
      variables: number
      skipped: { token: string; reason: string }[]
    }
    expect(summary.variables).toBe(1)
    expect(summary.skipped).toEqual([expect.objectContaining({ token: '--on-blue' })])
  })

  it('diffs a read result against the code', async () => {
    const out = mkdtempSync(join(tmpdir(), 'figma-'))
    run('read', '--out', join(out, 'read.js'))
    const { run: execute } = createFakeFigma()
    const figma = await execute(readFileSync(join(out, 'read.js'), 'utf8'))
    writeFileSync(join(out, 'figma.json'), JSON.stringify(figma))
    expect(run('diff', '--tokens', tokens, '--figma', join(out, 'figma.json'))).toContain(
      'Not in Figma yet'
    )
  })

  it('explains a missing input', () => {
    expect(() => run('sync', '--out', tmpdir())).toThrow(/--tokens or --model/)
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma build && pnpm --filter @atom63/figma test -- cli`
Expected: FAIL, `dist/cli.js` does not exist.

- [ ] **Step 3: Implement `cli.ts`**

```ts
#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { readTokenDirectory } from './css-files'
import { buildProjectModel, type ProjectModel } from './css-model'
import { diffTokens, formatDiff } from './diff'
import type { SnapshotCollection, SyncModel } from './plan'
import { buildReadScript, buildScripts } from './scripts'

function fail(message: string): never {
  process.stderr.write(`atom63-figma: ${message}\n`)
  process.exit(1)
}

function project(values: { tokens?: string; model?: string }): ProjectModel {
  if (values.tokens) return buildProjectModel(readTokenDirectory(values.tokens))
  if (values.model) {
    const model = JSON.parse(readFileSync(values.model, 'utf8')) as SyncModel
    return { model, sources: {}, notes: [] }
  }
  return fail('pass --tokens or --model')
}

const [command, ...rest] = process.argv.slice(2)
const { values } = parseArgs({
  args: rest,
  options: {
    tokens: { type: 'string' },
    model: { type: 'string' },
    out: { type: 'string' },
    figma: { type: 'string' },
  },
})

try {
  if (command === 'sync') {
    const { model } = project(values)
    if (!values.out) fail('pass --out <dir>')
    mkdirSync(values.out, { recursive: true })
    const write = (prefix: string, scripts: string[]) =>
      scripts.map((script, index) => {
        const file = `${prefix}-${index + 1}.js`
        writeFileSync(join(values.out as string, file), script)
        return file
      })
    process.stdout.write(
      `${JSON.stringify(
        {
          scripts: write('sync', buildScripts(model, 'sync')),
          checks: write('check', buildScripts(model, 'check')),
          variables: model.collections.reduce((total, item) => total + item.variables.length, 0),
          skipped: model.skipped,
        },
        null,
        2
      )}\n`
    )
  } else if (command === 'read') {
    if (!values.out) fail('pass --out <file>')
    writeFileSync(values.out, buildReadScript())
  } else if (command === 'diff') {
    if (!values.figma) fail('pass --figma <read-result.json>')
    const figma = JSON.parse(readFileSync(values.figma, 'utf8')) as SnapshotCollection[]
    process.stdout.write(formatDiff(diffTokens(project(values), figma)))
  } else {
    fail('commands: sync, read, diff')
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
```

Add to `package.json`: `"bin": { "atom63-figma": "./dist/cli.js" }` and
`"./node": { "@atom63/source": "./src/node.ts", "types": "./dist/node.d.ts", "import": "./dist/node.js" }`
under `exports`. Add `src/cli.ts` and `src/node.ts` to the library `entry` in `tsup.config.ts`;
tsup keeps the `#!/usr/bin/env node` line of an entry and marks the output executable.

The relative-color test needs `buildProjectModel`'s default resolver (`parseColor`) to return
null for `oklch(from …)` and the model to list the token under `skipped` with a reason; the
plugin's browser resolver still computes it. Check the existing behaviour first (`project-sync`
tests already cover "reports a relative color it cannot compute without a browser"); if it
already passes, no change to `css-model.ts` is needed.

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @atom63/figma build && pnpm --filter @atom63/figma test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/figma
git commit -m "feat(figma): add the atom63-figma CLI for agent sync and diff"
```

---

### Task 7: The agent guide, and an end-to-end run in real Figma

**Files:**

- Create: `packages/figma/README.md`
- Modify: `docs/design-system/figma-token-sync-spec.md` (the CLI change from the spec)

**Interfaces:**

- Consumes: the `atom63-figma` CLI from Task 6.

- [ ] **Step 1: Write `packages/figma/README.md`**

```markdown
# @atom63/figma

Sync design tokens between code and Figma variables. Code is the source of truth: an agent
writes the tokens into a Figma file through the Figma MCP server, and brings edits made in Figma
back into the token CSS.

## Install

    pnpm add -D @atom63/figma

## Sync code to Figma

1. `pnpm atom63-figma sync --tokens src/styles/tokens --out .figma-sync`
2. Run each `.figma-sync/sync-N.js` in order with the Figma MCP server's `use_figma` tool on the
   target file. Each returns `verification`; every one must report `create: 0` and `update: 0`.
3. Anything under `skipped` in the summary is not a Figma variable (shadows, font stacks,
   relative colors the CLI cannot compute); the summary gives the reason for each.

Run the `check-N.js` scripts any time to confirm the file still matches the code without writing.

## Bring Figma edits into code

1. `pnpm atom63-figma read --out .figma-sync/read.js`
2. Run it with `use_figma`, and save what it returns as `.figma-sync/figma.json`.
3. `pnpm atom63-figma diff --tokens src/styles/tokens --figma .figma-sync/figma.json`
4. Apply the listed changes to the CSS. Keep a `var()` where the new value is another token, and
   where the code computes a value with `calc()`, change the input instead of the result.
5. Sync again, and confirm the check scripts report no changes.

Variables are matched by their web code syntax, `var(--token)`, which Dev Mode shows. A variable
without it was made in Figma: syncs leave it alone, and `diff` lists it as a proposed token.

## Atom63

In the Atom63 repository, use the generated token set instead of CSS:
`pnpm atom63-figma sync --model packages/styles/generated/atom63.figma-sync.json --out .figma-sync`.
```

- [ ] **Step 2: Record the CLI change in the spec**

In `figma-token-sync-spec.md`, under Architecture, `CLI and MCP tools`, replace the bullet with:
"**CLI:** `atom63-figma sync`, `read` and `diff`, shipped in this package because `@atom63/cli`
is not published. MCP tools that wrap the same commands can come later." In "Code to Figma" and
"Figma to Code", replace `figma_sync` and `figma_diff` with the matching CLI commands.

- [ ] **Step 3: Run the end-to-end check in real Figma (manual, needs the Figma MCP server)**

1. Create a new Figma design file with the Figma MCP server's `create_new_file` tool.
2. `node packages/figma/dist/cli.js sync --tokens ~/Projects/atom63-site-template/src/styles/tokens --out /tmp/figma-e2e`
3. Run every `sync-N.js` with `use_figma`; each `verification` must be `create: 0, update: 0`.
4. Run every `check-N.js`; each `planned` must be `create: 0, update: 0`.
5. Edit `radius/base` in one mode with a short `use_figma` script, and create one variable
   without code syntax.
6. `read`, run it, save the result, `diff`: the output must list the radius edit with its file and
   selector, and the new variable under "Variables made in Figma".
7. Run the sync scripts again: the radius goes back to the code value; the Figma-made variable is
   still there.
8. Repeat steps 2 to 4 with `--model packages/styles/generated/atom63.figma-sync.json` in a second
   new file.

Record the results (script counts and sizes, verification totals, the diff output) in the pull
request description.

- [ ] **Step 4: Full verification the way CI does**

```bash
rm -rf packages/figma/dist
pnpm --filter @atom63/figma build && pnpm --filter @atom63/figma typecheck && pnpm --filter @atom63/figma lint && pnpm --filter @atom63/figma test
pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin lint && pnpm --filter @atom63/figma-plugin build
pnpm --filter @atom63/styles test && pnpm --filter @atom63/styles check:figma
pnpm api:report
npx prettier --check packages/figma docs/design-system
```

Expected: all pass (`pnpm api:report` may write a new report for `@atom63/figma`; commit it).

- [ ] **Step 5: Commit**

```bash
git add packages/figma docs/design-system
git commit -m "docs(figma): add the agent guide for syncing tokens with Figma"
```

</content>
