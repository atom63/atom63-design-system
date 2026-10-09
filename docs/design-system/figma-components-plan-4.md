# Figma components, plan 4: Cipher interaction, round 2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

Status: agreed on 2026-10-09; follows the UI review fixed in #143.

**Goal:** Cipher tells the user what the open file holds and what to do next, a difference in a
result takes the user to the node in Figma, the plugin opens fast, and the plugin's own code is
held to the same craft rules as the design system.

**Architecture:** No new engine behaviour beyond reporting node ids. The plugin keeps
`@atom63/figma` as its only engine and `@atom63/ui-react` as its only UI kit. Verification uses
the QA harness from the #143 review (real engine replies, axe, Tab order, screenshots) plus a
real-Figma run for the parts the harness can't prove (selection and viewport).

**Spec:** [figma-components-plan-3.md](./figma-components-plan-3.md) (P1–P5) and
[apps/figma-plugin/docs/ARCHITECTURE.md](../../apps/figma-plugin/docs/ARCHITECTURE.md).

## Decisions

| # | Question | Decision |
| --- | --- | --- |
| R1 | How does a difference reach the canvas? | The engine adds `nodeId` to each `Difference` (variant node, or the card part). The UI renders each line as a button; clicking sends `select-node`; the main thread loads the node's page, makes it current, selects the node and calls `figma.viewport.scrollAndZoomIntoView`. A node that no longer exists returns an error the view shows inline. |
| R2 | What does Home lead with? | A one-line **file status** (empty file / site-template tokens / Atom63 design system / another token set) and the **recommended** entry gets the primary button: empty → none recommended (all three equal); template tokens → Import again; Atom63 → Update Atom63 design system. Entries that don't apply are hidden, not disabled, except the Atom63 entry on another token set, which keeps its reason (P5). |
| R3 | How does the plugin open faster? | The bundled models are emitted as `JSON.parse('…')` string literals at build time (V8 parses JSON strings faster than object literals), and are parsed lazily on the first `atom63-*` message. Home shows a skeleton of its cards instead of a spinner while scanning. |
| R4 | Craft rules for the plugin | `apps/figma-plugin/src` joins `check:craft`'s source roots. Existing violations are fixed where cheap; the rest go into the craft baseline so the check passes, with a count in the PR. |
| R5 | Input focus ring | Measured first: the focus indicator must reach 3:1 against the field and the page (WCAG 2.2 1.4.11 / 2.4.13). If it fails, the fix is a token change in `@atom63/styles` for the ring's alpha/colour, not a plugin override. If it passes, nothing changes and the measurement is recorded. |

## Global constraints

- `@atom63/figma` stays the only engine; the plugin writes no nodes itself (selection and viewport only).
- Repo rules 1–10 (AGENTS.md); no literal colours; focus on `:focus-visible` as outlines.
- QA harness: 0 axe violations in every state, Tab order reaches every action, screenshots before/after.
- Changesets per AGENTS.md (`@atom63/figma` for `nodeId`; `@atom63/styles` if R5 changes a token).

---

### Task 1: Differences take you to the node (R1)

**Files:** `packages/figma/src/components/sync-component.ts` (+ spec-card differences), plugin
`src/messages.ts`, `src/main/handle.ts`, `src/main/figma-api.ts`, `src/app/atom63-state.ts`,
`src/app/Atom63.tsx`; tests in both packages; harness `select-node` reply.

- [ ] `Difference.nodeId` for variant and card differences; engine test.
- [ ] `select-node` message, handler (page load + current page + selection + zoom), error when gone; handler test with the fake.
- [ ] Difference lines become buttons with an accessible name ("Show Button · primary / md / rest in Figma"); harness shows them; axe clean.

### Task 2: File status and the recommended next step (R2)

**Files:** `src/app/Home.tsx`, a pure `home-state.ts` helper + tests, `app.module.css`.

- [x] `fileStatus(table, atom63)` → `{ kind, line, recommended, entries }` with tests for the four kinds. Another token set is one with no `Base` collection, which the site template's model always writes; Cipher, the CLI and an agent write the same table, so they are not told apart.
- [x] Home renders the status line, the recommended entry as primary, hides entries that don't apply (R2).
- [x] Skeleton cards while scanning (R3 UI part), `aria-busy` on main and a hidden "Reading this file…" status.

### Task 3: Faster open (R3)

**Files:** `apps/figma-plugin/build.js`, `src/main/atom63-models.ts`, handler tests.

- [x] Models emitted as JSON strings and parsed on first use; test that token-only messages never parse them.
- [x] Measure `dist/code.js` evaluate time before/after in Node (report numbers): compile and run its top level, `figma` and `__html__` stubbed, median of 10 fresh processes: 7.9 ms before, 3.2 ms after; `dist/code.js` 693 KB before, 761 KB after (a JSON string keeps its keys' quotes). The first `atom63-*` message then parses both models in about 1.6 ms.

### Task 4: Craft rules cover the plugin (R4)

**Files:** `scripts/design-system/check-craft.mjs`, `docs/design-system/audits/craft-baseline.json`, plugin CSS/TSX fixes.

- [x] Add the root; fix cheap violations (literal font sizes → tokens, physical properties → logical); baseline the rest; `pnpm check:craft` passes. The check now reads `.scss` too, so `ui.scss` is covered. Before: 20 violations in the plugin (18 in `ui.scss`: 10 `focus-ring-outline`, 6 `physical-properties`, 2 `focus-visible`; 2 in `ErrorBoundary.module.css`). `ui.scss` held 138 legacy classes from the token manager of which the UI used 3 (`plugin-root`, `plugin-container`, `plugin-main`, no dynamic class names); the rest and the layout variables nothing reads are deleted, and the QA harness screenshots are pixel-identical. The error boundary's ring is an outline and its details start-aligned; literal 12px/11px font sizes read `--typography-xs-font-size` and `--text-xs`. After: 0, and the craft baseline stays empty.

### Task 5: Input focus ring (R5)

- [x] Measured on 2026-10-09 in the QA harness (compact density, 3px ring, composited pixels). Every combination failed 3:1:

  | Brand | Mode | Ring | vs page | vs field |
  | --- | --- | --- | --- | --- |
  | b2 | light | #f3c7ac | 1.36 | 1.51 |
  | b2 | dark | #63371c | 1.59 | 1.88 |
  | b1 | light | #b5cef5 | 1.41 | 1.56 |
  | b1 | dark | #253e65 | 1.48 | 1.76 |

- [x] The token fix (`--a63-focus-ring` = brand 600 in light, 400 in dark; 4.4–9.6:1) changes every focusable control in the system, so it ships separately in the `fix/focus-ring-contrast` PR, with its Storybook visual baselines.

### Task 6: Acceptance

- [ ] QA harness before/after for every state; axe 0; Tab order.
- [ ] Real Figma: click a difference → node selected and in view (break one variant by hand first); Home status line in an empty, a template and an Atom63 file.
