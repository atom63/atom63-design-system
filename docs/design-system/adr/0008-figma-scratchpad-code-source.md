# ADR 0008: Figma is a scratchpad, code is the source; no Organization-only Figma features

**Status:** Accepted. "Code is the source of truth" agreed 2026-09-28 (Figma token sync spec D2);
the scratchpad role, the plan limits and one-way sync confirmed 2026-10-10 (next-phase roadmap
premise 5, N9 and N10). The scratchpad restructure (F1c) is not built yet.

## Context

Early on, tokens synced both ways: Figma edits in any collection mode could be exported back to
the DTCG sources. Two-way sync conflicts with a single source, and it carries the largest
maintenance surface. The Figma model also grew to 14 collections, one per personalization axis,
which scattered semantic colours (`action/primary` in Brand, `action/danger` in Mode) and made
tokens hard to find. Plan limits matter for a one-person system: Professional allows 10 modes per
collection, Code Connect needs Organization or higher, and extended collections are
Enterprise-only.

## Decision

- Code is the only source of truth. Figma is a place to explore with the system's tokens; what is
  found there goes back through code (an agent reads the design through MCP, implements it, and
  re-syncs). No two-way merge.
- Code changes reach Figma through one engine, `@atom63/figma`, with two entries: agents and
  repositories sync through the Figma MCP server; people without an agent use the plugin.
- The Figma structure must not depend on Organization or Enterprise features (Code Connect,
  extended collections, the variables REST API), and no collection may exceed 10 modes.
- Planned structure (N9): three layers, Primitive, Alias (brand modes) and Semantic (light and
  dark), plus one collection per size knob, regenerated into a new file. Themes and component
  tokens stay out of the scratchpad; a theme is explored in its own generated file.
- The token-patch write-back from Figma is to be frozen (N10, F1c-3).

## Options considered

- **Structure (N9):** keep the 14 axis collections (too heavy for a scratchpad), three layers
  (chosen; the layering designers know and fits Professional), or two layers without brand modes
  (lightest, but exploring a brand means switching files).
- **Sync (N10):** keep two-way sync with both plugin and MCP paths (conflicts with one source,
  largest surface), one-way code to Figma with one engine (chosen), or drop Figma (loses quick
  exploration).
- **Extended collections for brands and themes:** closer to how Figma models brands, but
  Enterprise-only and unable to add variables. The plugin update plan recommended against them,
  and the token sync spec (2026-09-28) lists them as out of scope.

## Consequences

- Good: no paid-tier dependency beyond Professional; the current model's largest collection has 8
  modes.
- Good: Figma cannot silently become a second source; a designer's change is reviewed as code.
- Bad: no Code Connect, so Figma Dev Mode does not link components to code. This is a known gap
  against what design-systems reviewers look for (noted in the positioning proposal).
- Bad: designers lose direct write-back. They depend on an agent or a developer to land a change.
- Bad: the decision is ahead of the code. The generated model still has 14 collections, and
  CONTRIBUTING still documents the Figma-to-code token patch. F1c has a plan but no merged PR.
- Bad: tokens that vary on two axes, and themes derived from the brand colour such as terminal,
  can only be stored as precomputed values in Figma.

## Evidence

- [figma-token-sync-spec.md](../figma-token-sync-spec.md): decisions D2, D3; "Out of scope"
  (extended collections).
- [roadmap-next.md](../roadmap-next.md): premise 5, conclusion 4, N9, N10 (with the 2026-10-20
  note), decision table.
- [figma-plugin-update-plan.md](../figma-plugin-update-plan.md): plan limits and F6 (extended
  collections).
- [f1-plan.md](../f1-plan.md), section F1c (not yet implemented).
- Earlier two-way sync: [#9](https://github.com/atom63/atom63-design-system/pull/9),
  [#28](https://github.com/atom63/atom63-design-system/pull/28).
- One engine and the MCP path: [#125](https://github.com/atom63/atom63-design-system/pull/125),
  [#126](https://github.com/atom63/atom63-design-system/pull/126),
  [#133](https://github.com/atom63/atom63-design-system/pull/133); N10 reconciled with the spec:
  [#169](https://github.com/atom63/atom63-design-system/pull/169).
- Current model: `packages/styles/generated/atom63.figma-sync.json` (14 collections), checked by
  `check:figma`.
- Internal record: the positioning plan (2026-11-21) keeps Code Connect out of scope.
