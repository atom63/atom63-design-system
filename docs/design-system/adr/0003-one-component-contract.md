# ADR 0003: One component contract for React, SwiftUI and Figma

**Status:** Accepted. Direction set 2026-09-24 (roadmap phase C, item 2); format and axes decided
2026-10-10 (next-phase roadmap N1 and N2); JSON sources shipped 2026-10-20.

## Context

Component intent lived in two places: TypeScript contracts in `@atom63/ui-foundation` (69 at the
time) and a separate `cross-renderer-contracts.json` (27 components). The cross-renderer generator
read the TypeScript with regular expressions, and Badge already needed a special case. iOS axes
were hand-written: `AtomButton` declared its own 6 variants and 4 sizes with no check against the
web's 10 variants and 11 sizes.

## Decision

Each component has one contract source, `packages/ui-foundation/contracts/components/<name>.json`,
validated by a JSON Schema. It holds intent, axes, defaults, slots, states, token slots, maturity
and, where an iOS counterpart exists, a `crossRenderer` block. From it the build generates the
TypeScript contract types used by React props, the docs contract section, the agent index and the
Swift enums. Axes are semantic at the intent layer (for Button: tone x emphasis x size); each
renderer maps them to its own idiom. React keeps shadcn-style `variant` values, SwiftUI maps to
roles and native styles. Web-only values are marked as platform extensions.

## Options considered

- **A. TypeScript stays the source,** read with the compiler API. Smallest change, but the source
  stays in one platform's language.
- **B. Neutral data (JSON + Schema) as the source.** Chosen. Cleanest generation chain; the cost is
  migrating every contract.
- **C. Put component intent in DTCG `$extensions`.** DTCG is not designed for it and tools do not
  read it.
- For axes: keep the web axes with per-platform subsets (still web-centred), or a separate iOS
  axis set (gives up the single source). Semantic axes with per-renderer mapping was chosen.

## Consequences

- Good: 77 contract sources, 31 with a cross-renderer block. Button and Badge Swift enums are
  generated from the contract intent; renaming a state now changes generated Swift, which a check
  catches.
- Good: a consistency lint and the readiness review found and removed near-synonyms (for example
  `default` vs `md` sizes, `focus` vs `focus-visible`), with deprecated aliases kept for callers.
- Bad: most iOS views still map to hand-written Swift enums through `swiftEnum`; only Button and
  Badge are generated. Several iOS axes are still missing (listed in the review backlog).
- Bad: on the Figma side the contract drives only the generated Button component set and spec
  cards. The Figma scratchpad plan generates no components for now
  ([ADR 0008](./0008-figma-scratchpad-code-source.md)), so "one contract for Figma" is partial.

## Evidence

- [roadmap.md](../roadmap.md), goal 5, direction 2.
- [roadmap-next.md](../roadmap-next.md), section 1 (the Button example), N1 and N2, decision table.
- [cross-renderer-contracts.md](../cross-renderer-contracts.md): parity levels and the alignment
  model.
- JSON sources: [#153](https://github.com/atom63/atom63-design-system/pull/153),
  [#154](https://github.com/atom63/atom63-design-system/pull/154); schema check in CI:
  [#175](https://github.com/atom63/atom63-design-system/pull/175).
- Semantic axes and generated Swift: [#155](https://github.com/atom63/atom63-design-system/pull/155),
  [#156](https://github.com/atom63/atom63-design-system/pull/156).
- Contract values enforced in React props: [#187](https://github.com/atom63/atom63-design-system/pull/187).
- Consistency lint: [#285](https://github.com/atom63/atom63-design-system/pull/285); canonical
  names and iOS intent maps: [#307](https://github.com/atom63/atom63-design-system/pull/307); slot
  check: [#310](https://github.com/atom63/atom63-design-system/pull/310).
- Figma Button component set from the contract and recipe:
  [#139](https://github.com/atom63/atom63-design-system/pull/139).
