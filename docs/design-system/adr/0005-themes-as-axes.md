# ADR 0005: Themes as orthogonal axes, with contrast checked in CI

**Status:** Accepted. The axis model predates this repository (the axis registry was extracted on
2026-09-21). iOS scope decided 2026-09-24 (roadmap D2). Public axes narrowed 2026-10-10
(next-phase roadmap N4), not yet implemented.

## Context

A product needs to change look without forking components: light and dark, a brand colour, a
visual skin, density, type scale, radius and font. If these are mixed into one "theme" switch,
every combination must be designed and tested by hand, and adding one value multiplies the work.

## Decision

Personalization is a fixed set of axes, each set by a `data-a63-*` attribute (or one scalar
property), inherited, applicable at any scope, and owning its own slice of tokens. The registry
in `packages/ui-foundation/src/axes.ts` is the single source; it lists 13 axes. The main ones:

- **Mode** (light, dark) changes luminance of the semantic colours.
- **Brand** (b1 to b6, auto) picks the primary ramp; status colours stay semantic.
- **Theme** (modern, aqua, retro, terminal) is a skin over the component layer; it decides which
  step of a scale a component uses.
- **Density, radius and type scale** are knobs that scale a whole scale through one multiplier
  (`--a63-space-unit`, `--radius-multiplier`, `--typography-scale`). **Font** selects a family.

A theme and a knob multiply: retro with round radius is `radius-sm x 1.5`. The test for brand vs
theme: brand decides which colours, theme decides how they are used, and a theme must work on any
brand. Contrast of the declared text, action and status pairs is a browser test that runs in CI
for every theme x mode, and the brand pairs for every brand.

## Options considered

- **One theme per look** (each a full palette). Not recorded as an option; the axis registry was
  the starting point.
- **N4, which axes are public for 1.0:** all 13 (most freedom, most drift); mode, brand, radius and
  density (chosen; the other themes become presets, the rest experimental); or mode and brand
  only (radius and density are common branding needs).
- **D2, iOS scope:** all axes; mode, brand and theme with density and type following iOS system
  mechanisms such as Dynamic Type (chosen); or mode only.

## Consequences

- Good: themes and brands compose; iOS renders theme x brand x surface x mode natively, and the
  roadmap records 144 combinations x 2 modes matching the browser.
- Good: contrast regressions fail CI, including inside nested theme and mode scopes.
- Bad: every axis multiplies visual baselines, iOS combinations and Figma modes. Only 40 of 76 web
  components had a four-theme baseline at the first readiness review.
- Bad: 57 tokens vary on more than one axis, which Figma can only precompute.
- Bad: the contrast test covers declared pairs only. A token used outside its role (the Tailwind
  `text-primary` painting the action fill as text, 2.9:1 on dark) passed until a role check was
  added. Nested brand and surface scopes still have open findings.
- Bad: N4's narrowing is decided but not implemented: the registry marks no axis experimental.

## Evidence

- [personalization-axes.md](../personalization-axes.md): the axes and what each owns.
- [roadmap.md](../roadmap.md), decision D2 and its progress note (2026-09-25).
- [roadmap-next.md](../roadmap-next.md), N4 and the decision table.
- Contrast test: [`packages/styles/src/tokens/contrast.browser.test.ts`](../../../packages/styles/src/tokens/contrast.browser.test.ts),
  run by the "Test styles" CI step. Fixes it guards:
  [#16](https://github.com/atom63/atom63-design-system/pull/16),
  [#22](https://github.com/atom63/atom63-design-system/pull/22),
  [#145](https://github.com/atom63/atom63-design-system/pull/145),
  [#150](https://github.com/atom63/atom63-design-system/pull/150).
- Role check (`token-role`): [#285](https://github.com/atom63/atom63-design-system/pull/285);
  text in text roles: [#288](https://github.com/atom63/atom63-design-system/pull/288).
- Themes as DTCG resolvers: [#31](https://github.com/atom63/atom63-design-system/pull/31),
  [#32](https://github.com/atom63/atom63-design-system/pull/32); iOS:
  [#49](https://github.com/atom63/atom63-design-system/pull/49).
- Internal records: the full-review proposal and review worklog, 2026-11-18 (role gap, baseline
  coverage); nested-scope fixes are in open PR
  [#315](https://github.com/atom63/atom63-design-system/pull/315).
