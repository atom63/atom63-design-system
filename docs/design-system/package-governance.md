# Package Governance

> **Partially historical.** The live executable stack is `@atom63/styles`,
> `@atom63/ui-foundation`, `@atom63/ui-react` (plus `os63`, `mdx`, `widgets`, …).
> Archived `@atom63/tokens` / `@atom63/ui` / `@atom63/theme` names below are
> migration residue — do not teach them as current ownership.
> Authoring policy: [authoring-surfaces.md](./authoring-surfaces.md).
> Package map: `apps/design-system` → Architecture → Layers / Package map.

Atom63 packages stay scalable by keeping package responsibilities explicit and checked.

The published beta packages and how they are released are described in
[release-automation.md](./release-automation.md). This document describes package
ownership.

## Current package boundaries (prefer this)

- `@atom63/styles` — CSS foundation (shared scales), semantics, contracts, themes, OS CSS, adapters.
- `@atom63/ui-foundation` — typed component contracts + personalization axes SSOT.
- `@atom63/ui-react` — React renderer, recipes, appearance UI; theme state via `/theme`.
- `Atom63UI` (`packages/ui-ios`) — native SwiftUI renderer and generated shared tokens.
- `@atom63/os63` — desktop, windowing, OS chrome, OS-specific behavior.
- `@atom63/widgets` — headless widget views.
- `@atom63/mdx` — portable MDX prose and content blocks.
- `@atom63/brand` — brand marks and SEO helpers.
- `@atom63/dev` — development-only hooks.
- `@atom63/harness` — private visual-review metadata and scenario plumbing.

## Archived names (do not use for new work)

- `@atom63/tokens` — superseded by `@atom63/styles` (`archive/tokens/`).
- `@atom63/ui` — superseded by `@atom63/ui-react` + foundation.
- `@atom63/theme` — superseded by `@atom63/ui-react/theme` + styles axes.

## Readiness Checks

Run:

```bash
pnpm check:harness-architecture
```

This runs the cheap architecture gates for token usage, theme authoring, app consumption, package
governance, agent single-source data, and the current visual-review harness. Retired theme snapshot
checks are no longer part of the contract workflow.

## Adding Or Promoting A Package

1. Add or update the package manifest.
2. Add public exports intentionally.
3. Add package metadata to `packages/harness/src/registries/packages.ts`.
4. Document the consumer entry point in `USAGE.md`.
5. Add Storybook contact sheets or visual-review coverage when the package renders UI.
6. Run `pnpm check:harness-architecture`.

For `Atom63UI`, also run `pnpm ios:test` and `pnpm ios:build`.
