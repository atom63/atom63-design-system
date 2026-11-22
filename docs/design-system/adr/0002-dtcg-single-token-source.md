# ADR 0002: DTCG as the single token source

**Status:** Accepted, 2026-09-24 (roadmap decision D1). Shipped 2026-09-24 to 2026-09-25.

## Context

In September 2026 only about 56% of the token manifest (841 of 1,491 entries) came from DTCG
sources. Semantics, brand, component contracts and the four themes were hand-written CSS. Figma
and iOS saw only part of the system, and iOS had already drifted: its primary colour was a
hand-mapped value whose white label reached 3.6:1, an AA failure the web had just fixed.

## Decision

Every token layer (foundation, semantics, brand, contracts, themes) is written in DTCG. Modes,
brands and themes are DTCG resolver contexts. CSS, the token manifest, the Figma sync model and
the Swift tokens are generated from those sources and never edited by hand. Rules for the move:

- One axis per token. A token that varies on two axes (brand x mode) is split into two tokens
  joined by an alias, because a Figma collection has one mode dimension.
- Formulas are declared, not hidden: a derived value keeps its CSS expression in
  `$extensions["io.atom63.derive"]`, and Figma shows it as derived.
- Values DTCG cannot type stay in `*.native.css`, each listed with a reason.

## Options considered

- **A. Move every layer to DTCG, in two steps** (semantics and brand first, then contracts and
  themes). Chosen. Largest effort (about 650 tokens and 187 theme formulas), but the only option
  that takes themes into Figma and iOS.
- **B. Move up to the semantic layer only.** About half the work; themes stay a black box.
- **C. Keep CSS as the source** and add a CSS-to-manifest completeness check. Cheapest; does not
  remove the drift.

## Consequences

- Good: 1,603 of 1,669 manifest entries are generated; the other 66 are native values with a
  recorded reason. No other token is hand-written.
- Good: iOS colours, brands and themes now come from the same data; iOS resolves skin, brand and
  surface natively, and parity tests compare resolved values.
- Bad: DTCG resolver tool support is thin (the next-phase roadmap notes that Style Dictionary does
  not support resolvers), so Atom63 keeps its own generators. They are kept but not expanded.
- Bad: 57 tokens still vary on more than one axis. Figma can only store them as precomputed
  combinations.
- Bad: every token change needs a regenerate step; contributors must not edit the CSS.

## Evidence

- [roadmap.md](../roadmap.md), goal 4 and decision D1; phase table rows A and B.
- [token-single-source.md](../token-single-source.md): rules, slices and final counts.
- iOS drift fix: [#24](https://github.com/atom63/atom63-design-system/pull/24).
- Migration slices: [#25](https://github.com/atom63/atom63-design-system/pull/25) to
  [#32](https://github.com/atom63/atom63-design-system/pull/32),
  [#45](https://github.com/atom63/atom63-design-system/pull/45),
  [#46](https://github.com/atom63/atom63-design-system/pull/46); docs in
  [#38](https://github.com/atom63/atom63-design-system/pull/38).
- iOS native resolution: [#49](https://github.com/atom63/atom63-design-system/pull/49).
- Checks in CI: `check:dtcg`, `check:tokens`, `check:figma`, and the `swift-parity` and
  `figma-parity` browser tests in `packages/styles/src/tokens/`.
- Tooling gap and the 57 multi-axis tokens: [roadmap-next.md](../roadmap-next.md) section 6 and N4;
  [f1-plan.md](../f1-plan.md).
