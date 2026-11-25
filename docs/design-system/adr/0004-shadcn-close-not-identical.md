# ADR 0004: A component API close to shadcn, not identical; role bridges and a registry instead

**Status:** Accepted, 2026-09-24 (roadmap decision D4: A first, then B in phase C). Role names
extended 2026-10-10 (next-phase roadmap N3). Positioning confirmed 2026-11-21; the positioning
line and the templates-only registry are replaced by [ADR 0009](./0009-opinionated-open-source-for-ai-products.md)
(proposed 2026-11-24).

## Context

Agents and many developers already know shadcn/ui: its role names (`bg-primary`,
`text-muted-foreground`, `ring-ring`) and its `variant` values. Atom63's components are built on
Base UI with recipes and `data-variant`, and share a contract with SwiftUI. In September 2026 the
role names worked, but the components could not replace shadcn's one for one, `--chart-*` and
`--destructive-foreground` were missing, and there was no registry.

## Decision

- Keep Atom63's own component implementation and API. Props follow shadcn conventions where they
  fit (`variant`, `size`, composition), but are not a 1:1 copy.
- Fill the missing shadcn roles, and ship two opt-in role bridges: `compat/shadcn` (shadcn names
  on top of the `--a63-*` layer, generated from one role table) and `compat/a63-from-shadcn` (the
  `--a63-*` layer defined from a shadcn host's variables, so Atom63 components render in a plain
  shadcn app).
- Publish a shadcn registry at `system.atom63.io/r`.
- Name semantic roles with shadcn's vocabulary plus same-grammar extensions (`success`, `warning`,
  `info`, surface levels, `selected`), keeping the `--a63-` prefix in CSS.

## Options considered

- **A. Keep the current API and add the missing tokens.** Cheapest. Chosen as the first step.
- **B. Also ship a shadcn registry.** Chosen for phase C.
- **C. Align the component API with shadcn completely.** Why not: a large rewrite, and it loses
  what Base UI and the shared contract give.
- On positioning (2026-11-21): leading with "add Atom63 to your shadcn app" was proposed, then
  replaced by positioning as an in-house-grade system, with shadcn compatibility as one
  integration.

## Consequences

- Good: shadcn hosts and agents can use familiar role names; a shadcn app can render Atom63
  components through the reverse bridge.
- Good: the `variant` axis can stay shadcn-like on the web while the contract keeps semantic axes
  for iOS ([ADR 0003](./0003-one-component-contract.md)).
- Bad: two vocabularies exist (`--a63-*` and the shadcn aliases), and a bridge can be incomplete:
  round 1 of the readiness review found 139 `--a63-*` tokens the reverse bridge left undefined.
- Bad: the registry ships page templates and blocks, not component source. A shadcn user cannot
  copy an Atom63 Button into their project the way they copy a shadcn one.
- Bad: "looks like shadcn" invites being read as a shadcn clone; the positioning work exists to
  answer that.

## Evidence

- [roadmap.md](../roadmap.md), goal 4 ("Tailwind / shadcn") and decision D4.
- [roadmap-next.md](../roadmap-next.md), N2 and N3, decision table.
- Role table and bridges: [#150](https://github.com/atom63/atom63-design-system/pull/150);
  [`packages/styles/src/compat/`](../../../packages/styles/src/compat/).
- Registry: [#99](https://github.com/atom63/atom63-design-system/pull/99) (`check:registry`, and
  `check:starter --shadcn` runs `shadcn add`).
- Reverse bridge completed: [#305](https://github.com/atom63/atom63-design-system/pull/305)
  (finding r1-tokens-3).
- Internal record: the positioning proposal and plan, 2026-11-21 (options C and D).
