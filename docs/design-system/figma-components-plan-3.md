# Figma components, plan 3: Cipher builds the Atom63 design system

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

Status: agreed on 2026-10-08 (decision P1 by the owner); builds on
[figma-components-plan-2](./figma-components-plan-2.md).

Progress: Tasks 1–4 are done (engine entry, main thread, the Atom63 view, docs) on
`feat/cipher-atom63`; Task 5, the acceptance in real Figma, is open. P5 was made strict during
Tasks 1–2, so Task 5's template-table file expects the refusal, not a warning.

**Goal:** In the Cipher plugin, one click on **Atom63 design system** writes the Atom63 token
set (variables, text and effect styles), every generated component (Button today) and its spec
card into the open file, shows progress, then verifies and reports the result. A second click
changes nothing. The agent path (`atom63-figma sync` / `components`) stays as it is.

**Architecture:** Cipher stays a thin interface over `@atom63/figma`. The main thread receives
the bundled Atom63 models (the generated `atom63.figma-sync.json` with derived styles and
`atom63.figma-components.json`) and runs the engine in process: `syncModel`, then
`syncComponent` per component, then a separate check in a later main-thread task (so Figma's
asynchronous property-reference reconciliation has settled). No `use_figma` scripts, no
49,000-character limit. Text in the spec cards keeps its single source (catalog → index → model).

**Tech Stack:** TypeScript, React 19 (`@atom63/ui-react` in the plugin UI), esbuild (plugin build),
Vitest, the `@atom63/figma` fake for tests, Figma desktop for acceptance.

**Spec:** [figma-token-sync-spec.md](./figma-token-sync-spec.md) and
[apps/figma-plugin/docs/ARCHITECTURE.md](../../apps/figma-plugin/docs/ARCHITECTURE.md).

## Decisions

| # | Question | Decision |
| --- | --- | --- |
| P1 | Does the plugin get an Atom63 mode? | Yes. It replaces "The plugin has no Atom63 mode" (ARCHITECTURE) and extends D8 ("Create and Import") with a third entry, **Atom63 design system**: tokens + styles + components + spec cards. Components bind Atom63 variables, so they are offered only together with the Atom63 token set, never on a template project's tokens. |
| P2 | Where do the models come from? | The generated, CI-guarded files, bundled at plugin build time: `packages/styles/generated/atom63.figma-sync.json` (styles derived with `deriveStyles`, as the CLI does) and `packages/figma/generated/atom63.figma-components.json`. No copy is committed in the plugin. |
| P3 | How is the build verified? | The build message returns the sync outcome; the UI then sends a separate **check** message (a new main-thread task). A check that still reports `pendingReferences` shows "Figma is still settling — check again" with a button, never a failure. |
| P4 | Progress | The main thread posts `progress` messages (phase, done/total) while it works; the UI shows them. Long loops yield to Figma between components so the UI stays responsive. |
| P5 | Conflicts with an existing template table | (Revised 2026-10-08, owner decision; replaces warn-and-confirm.) If the file holds any token table that is not provably Atom63's, the Atom63 build refuses: `status: 'blocked'`, zero writes, and the reason "This file already holds another token set (collections: …). Start the Atom63 design system in a new file." There is no confirmation path. The ownership rule is in `packages/figma/README.md` (Building the whole design system in a file). |

## Global constraints

- `@atom63/figma` stays the only engine; the plugin adds no Figma writing logic of its own.
- Second run: tokens, styles, variants and card plan `create: 0, update: 0`.
- Generated files are never edited by hand; the plugin bundles them at build time.
- The plugin UI uses `@atom63/ui-react` components and `--a63-*` tokens (repo rules 1–10).
- Accessibility: progress is announced (`aria-live`), buttons have names, focus moves to the result.

---

### Task 1: An engine entry for the whole design system

**Files:** Create `packages/figma/src/design-system.ts` (+ export), `test/design-system.test.ts`.

- [x] `buildDesignSystem(figma, { sync, components }, onProgress?)`: derive styles if absent,
  `syncModel`, then `syncComponent` for each component model; returns one outcome with token,
  style, component and card counts, `differences`, `pendingReferences`, `fontFallbacks`.
- [x] `checkDesignSystem(figma, …)`: read-only, same shape.
- [x] `readDesignSystemTable(figma)`: what the file holds now (Atom63 table present? template
  table present? Button set and card present?) for the Home view and P5.
- [x] Tests on the fake: fresh file → clean; second run zero writes; plan-1 file (set on the
  page) migrates into the card keeping its id; template table present → reported.

### Task 2: The plugin main thread

**Files:** Modify `apps/figma-plugin/src/messages.ts`, `src/main/handle.ts`, `src/main/figma-api.ts`,
`build.js` (bundle the two JSON models into `code.js`); tests in `apps/figma-plugin/__tests__/`.

- [x] Messages: `atom63-scan` → `atom63-table`; `atom63-build` → `progress`* then `atom63-built`;
  `atom63-check` → `atom63-checked`.
- [x] The main thread passes the real `figma` global as `NodesApi` (the narrow `figmaApi()` stays
  for the token-only flows).
- [x] Bundle size reported; the plugin still loads quickly (measure `code.js` size).

### Task 3: The plugin UI

**Files:** Create `apps/figma-plugin/src/app/Atom63.tsx` (+ state helper and test), modify
`src/ui.tsx`, `src/app/Home.tsx`, `src/app/Outcome.tsx` if shared.

- [x] Home shows a third entry **Atom63 design system** with one line of what it writes.
- [x] The view: what the file holds (from `atom63-scan`), a **Build** button (refused with the P5
  reason when the file holds another token set), progress, then the result: PASS, or the named differences; pending → "check again".
- [x] Tests for the state helper (like `create-state.ts`).

### Task 4: Docs

- [x] ARCHITECTURE.md (Atom63 section rewritten), spec D8 note, plugin README/description if
  user-facing, `packages/figma/README.md` (plugin path next to the agent path), changesets.

### Task 5: Real-Figma acceptance

- [ ] Import `apps/figma-plugin/manifest.json` as a development plugin (Cipher's own id), build
  with `pnpm --filter @atom63/figma-plugin build`.
- [ ] Fresh file: Build → PASS; Build again → no writes; MCP inspection as in plans 1–2.
- [ ] Plan-1 file (`Button` set on the page): Build → set moved into the card with the same id;
  this also closes plan 2's migration acceptance.
- [ ] Template-table file: the warning appears; nothing is deleted.
