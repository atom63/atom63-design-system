# ADR 0001: Base UI as the primitive layer

**Status:** Accepted. The decision predates this repository: Base UI was already the primitive
layer when the system was extracted from its first host app on 2026-09-21. The exact date of the
choice is not recorded; the reasons below are the author's, written down on 2026-11-21.

## Context

The React renderer needs accessible behaviour for overlays, menus, selects, tabs and similar
widgets: focus management, keyboard maps, ARIA roles and dismissal. Writing that from scratch is
the most expensive and error-prone part of a component library. The roadmap of 2026-09-24
describes the result as fact, not as an open question: components are built on Base UI (not
Radix), use the `render` prop, and are styled with `.a63-*` classes and `data-variant`, not cva.

## Decision

`@atom63/ui-react` wraps `@base-ui/react` for interactive behaviour. Atom63 owns the styling
(recipes reading `--a63-*` tokens), the props that the component contracts allow, and the
contract tests. Because Base UI types and composition semantics show through several public
APIs, the dependency is pinned to an exact version through the beta.

## Options considered

- **Radix primitives.** The most common choice in the shadcn ecosystem at the time. Why not:
  several of Radix's core people moved on to build Base UI (it describes itself as "from the
  creators of Radix, Floating UI and Material UI"), and Base UI has iterated faster since its 1.0
  in 2025-12, shipping roughly monthly, while Radix, now maintained by WorkOS, releases more
  slowly. shadcn made Base UI its default in 2026-07, which confirmed the bet: the primitive under
  the most common React stack is now the one Atom63 uses.
- **Primitives written from scratch.** Why not: the reason is not recorded. The cost of owning
  keyboard and focus behaviour for every widget is the usual one.
- **Base UI.** Chosen.

## Consequences

- Good: accessible behaviour comes from a maintained library; Atom63's own work goes into tokens,
  contracts, recipes and evidence.
- Good: the APG contract tests check Base UI's output, so upstream gaps are found and named.
- Bad: some upstream gaps cannot be fixed in a wrapper. Six are documented as issue drafts; two
  are worked around (Dialog `aria-modal`, Accordion `aria-controls`), four Select keyboard gaps
  remain known gaps. None of the drafts has been filed upstream.
- Bad: a Base UI release can change public types, so updates need review instead of automatic
  bumps. The pin and the Dependabot exclusion carry that cost.
- Bad: the API reads like shadcn (`render`, not `asChild`) but is not a drop-in replacement
  (see [ADR 0004](./0004-shadcn-close-not-identical.md)).

## Evidence

- Commit [`4368862`](https://github.com/atom63/atom63-design-system/commit/436886262d88f837f8ea054c63dec16e7722fe15)
  (2026-09-21): pin Base UI for beta adopters.
- [dependency-version-policy.json](../dependency-version-policy.json): `@base-ui/react`
  `pin-exact-through-beta`, with the reason.
- [#190](https://github.com/atom63/atom63-design-system/pull/190): Dependabot stops bumping the
  policy-pinned packages.
- [roadmap.md](../roadmap.md), goal 4, "Tailwind / shadcn" (2026-09-24).
- [audits/base-ui-issue-drafts.md](../audits/base-ui-issue-drafts.md); APG contracts in
  [#76](https://github.com/atom63/atom63-design-system/pull/76),
  [#81](https://github.com/atom63/atom63-design-system/pull/81); workarounds in
  [#83](https://github.com/atom63/atom63-design-system/pull/83).
- The reasons over Radix: the author's account (2026-11-21), checked against
  [Base UI's about page](https://base-ui.com/react/overview/about),
  [its repository](https://github.com/mui/base-ui) and shadcn/ui's
  [2026-07 changelog](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default).
