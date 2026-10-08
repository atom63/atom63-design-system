# Figma components, plan 2: the spec card, from one documented source

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

Status: agreed on 2026-10-08 (decisions S1–S3 by the owner); Tasks 1–5 done, Task 6 (the
real-Figma acceptance run) open. Builds on
[figma-components-plan-1](./figma-components-plan-1.md) (PR #139).

**Goal:** The generated Figma `Button` sits on a spec card that documents it with the same words
as the docs site and the agent index: summary, when to use, one line per variant, size and
state, related components, and a labelled variant grid. Every text has one source, the component
catalog. Changing it there updates the docs page, the agent index and the Figma card, and CI
fails until the generated files are regenerated.

**Architecture:**

```
apps/docs/src/lib/component-catalog.ts   (source of truth: summary, usage, related, axisGuidance)
  ├─ docs site: component reference page + component-button.mdx render the guidance table
  ├─ packages/cli/generated/agent-index.json   (generated, `check:index`)
  │     └─ packages/figma/generated/atom63.figma-components.json   (generated, `check:components`)
  │           └─ use_figma scripts → spec card in Figma
```

**Tech Stack:** TypeScript, React (docs), Vitest, the existing `@atom63/figma` writer and fake,
the local runner for the real-Figma acceptance run.

**Spec:** [figma-token-sync-spec.md](./figma-token-sync-spec.md) (D2 code is the source of truth)
and plan 1's decisions C1–C8.

## Decisions

| # | Question | Decision |
| --- | --- | --- |
| S1 | Where does documentation text live? | The component catalog (`component-catalog.ts`). A new optional `axisGuidance` field holds one line per contract value: `{ variant?, size?, state? }`, keyed by the contract's values. |
| S2 | What happens to the hand-written MDX? | `component-button.mdx` stops restating per-variant usage: its "Variant decisions" prose becomes the table rendered from the catalog, and the narrative keeps only "why" content. Its "When to use" paragraph is replaced by the catalog's `usage` (moved there if it says more). |
| S3 | Where does the Figma generator read the text? | From the generated agent index (`packages/cli/generated/agent-index.json`), never from docs source. The index gains `axisGuidance`. |
| S4 | Is guidance required? | For components that have a Figma model (Button now), every contract variant, rendered size (xs–xl) and state must have a line; a test fails otherwise. Other components may add it later. |
| S5 | What does the card look like? | A vertical auto-layout frame `Button` on the `Components` page: title (the slug) and group label; rows Summary, When to use, Variant, Size, State, Related (label column + value column, dividers); a header row of state names above the grid; a row label (`variant · size`) per grid row; the component set inside the card. Chrome binds to atom63 surface/text/border variables and the synced `Text/` styles, so it re-themes. |
| S6 | Who owns the card? | The generator. It is matched by name (`Button`, frame, on `Components`) and carries `builder` ownership only through its name; rows and labels are matched by layer name and rewritten; layers a designer adds inside it stay. The component set keeps its identity (matched inside the card, or adopted from the page on first run). |
| S7 | Native description | The component set's `description` = the summary + a link to the docs page (`componentDocPath`), shown in Assets and Dev Mode. |

## Global constraints

- One source of truth for every documentation string (S1). No string is typed twice.
- Runtime code stays free of Node/DOM imports; scripts < 49,000 characters; results < 20 KB.
- A second run plans `create: 0, update: 0` for the card as for the variants.
- Never edit generated files by hand; `check:index` and `check:components` run in CI.
- Changesets: `@atom63/figma` (minor) and the docs/CLI changes follow the repo's rules.

---

### Task 1: `axisGuidance` in the catalog, with a completeness test

**Files:** Modify `apps/docs/src/lib/component-catalog.ts` (type + Button entry),
`apps/docs/src/lib/component-catalog.test.ts`.

- [ ] Add `axisGuidance?: { variant?: Readonly<Record<string, string>>; size?: …; state?: … }`
  to `ComponentCatalogItem`.
- [ ] Fill Button with the reviewed text (the draft from the 2026-10-08 session, edited by the
  owner in review).
- [ ] Test: for Button, the keys equal `buttonVariants`, `xs…xl`, and `buttonStates`; every value
  is a non-empty sentence under 120 characters.

### Task 2: Docs render the table; MDX keeps the "why"

**Files:** Modify `apps/docs/src/components/component-reference-page.tsx` (+ test),
`apps/docs/src/lib/component-docs.ts` (markdown export for llms.txt), `apps/docs/src/pages/component-button.mdx`.

- [ ] The reference page renders a "Variants, sizes and states" table from `axisGuidance` when
  present; `componentDocMarkdown` includes it so `llms.txt` and the index markdown carry it.
- [ ] `component-button.mdx`: replace "Variant decisions" prose with the same table component;
  keep "Why it exists" and "Decisions worth knowing"; "When to use" renders the catalog `usage`.
- [ ] Docs tests and `pnpm --filter @atom63/docs build` pass.

### Task 3: The agent index carries it

**Files:** Modify `packages/cli/scripts/build-index.mjs`, `packages/cli/src/commands.mjs`
(the `component` command prints it), regenerate `packages/cli/generated/agent-index.json`.

- [ ] `axisGuidance` copied into each component entry; `atom63 component button` shows it; `--json` includes it.
- [ ] `pnpm --filter @atom63/cli check:index` passes after regenerating.

### Task 4: The component model carries the doc block

**Files:** Modify `packages/figma/src/components/model.ts`, `packages/figma/scripts/generate-components.mjs`,
`packages/figma/src/components/pack-component.ts`; regenerate `generated/atom63.figma-components.json`.

- [ ] `ComponentModel.doc = { slug, label, group, summary, usage, related, axisGuidance, docsPath }`
  read from `agent-index.json` (S3). Missing entry or missing guidance for a modelled value fails
  generation with a clear message.
- [ ] Test: changing the catalog text and regenerating the index makes `check:components` fail
  until the model is regenerated (drift guard across the chain).

### Task 5: The spec card in Figma

**Files:** Create `packages/figma/src/components/spec-card.ts`; modify `sync-component.ts`,
`nodes-api.ts`, `test/fake-nodes.ts`; tests in `test/spec-card.test.ts`.

- [x] Plan/apply/verify the card with the same `Check` pattern (S5, S6): frame, title, rows,
  header labels, row labels, chrome bindings (surface fill, text fills, divider strokes, text
  styles), set placement inside the card. Text writes load fonts first.
- [x] The set's `description` (S7).
- [x] The card is written by the LAST component part (it needs the whole set); earlier parts
  leave it alone. A part that runs alone still verifies its own variants.
- [x] Migration: a file from plan 1 (set directly on the page) gets the set moved into the card
  without losing its identity or instances.
- [x] Tests: first run builds the card; second run writes nothing; designer layer inside the
  card survives; text change in the model updates only that row; real-model run on the fake.

Done 2026-10-08 on the fake (Task 6 is the real-Figma gate). Choices made here: the card binds
`--a63-surface-panel` (fill), `--a63-border-subtle` (border, dividers),
`--a63-surface-border-width`, `--radius-md`, `--a63-text-primary` / `--a63-text-secondary`, and
the `--typography-xs-*` (values) and `--typography-lg-*` (title) size and line-height variables;
labels are a literal 11px, and texts take Geist from `--font-family-sans` unbound (reported in
`fontFallbacks`), since the Atom63 sync writes no `Text/` styles. A script that must make the set
makes it on the page and the last part moves it into the card's `Grid` (the same path migrates a
plan-1 file). Component and token scripts now carry separate runtimes, so the card's code does
not cost the token scripts room (token sync 9 → 4 parts; components 3 → 4).

### Task 6: Real-Figma acceptance and docs

- [ ] Regenerate scripts and the local runner; run in a new empty file and in a plan-1 file.
- [ ] MCP inspection: card present once, rows match the index text, set inside, labels align
  with grid rows/columns, theme switch re-themes the card; screenshot for the PR.
- [ ] README "Components" section and this plan's status updated; changesets.
