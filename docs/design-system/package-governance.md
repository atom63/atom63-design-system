# Package Governance

> Authoring policy: [authoring-surfaces.md](./authoring-surfaces.md). The package table in
> [AGENTS.md](../../AGENTS.md) is the short map.

Atom63 packages stay scalable by keeping package responsibilities explicit and checked.

The published beta packages and how they are released are described in
[release-automation.md](./release-automation.md). This document describes package
ownership.

## Current package boundaries

- `@atom63/styles` — CSS foundation (shared scales), semantics, contracts, themes, OS CSS, adapters.
- `@atom63/ui-foundation` — typed component contracts + personalization axes SSOT.
- `@atom63/ui-react` — React renderer, recipes, appearance UI; theme state via `/theme`.
- `Atom63UI` (`packages/ui-ios`) — native SwiftUI renderer and generated shared tokens.
- `@atom63/mdx` — portable MDX prose and content blocks.
- `@atom63/brand` — brand marks and SEO helpers.
- `@atom63/inform` — the inform pattern: message registry, arbiter and surfaces.
- `@atom63/agent` — the headless agent (chat) runtime and its React hooks.
- `@atom63/widgets` — the widget foundation: units, card and surface, states, hosted shell.
- `@atom63/cli` — the `atom63` CLI and MCP server.
- `@atom63/figma` — the Figma sync engine and CLI, used by the Figma plugin.
- `@atom63/templates` — private page and block templates, copied into projects.
- `@atom63/create` — the `create:app` starter scaffold.

## Archived names (do not use for new work)

- `@atom63/tokens` — superseded by `@atom63/styles`.
- `@atom63/ui` — superseded by `@atom63/ui-react` + foundation.
- `@atom63/theme` — superseded by `@atom63/ui-react/theme` + styles axes.

## Readiness Checks

These are the cheap architecture gates; CI runs them with the rest:

```bash
pnpm check:theme-authoring                          # theme overrides stay within the authoring rules
pnpm check:package-surface                          # published entry points and exports
pnpm check:package-correctness                      # publint and attw on the packed tarballs
pnpm --filter @atom63/ui-foundation check:contracts # contract JSON → generated TS and cross-renderer metadata
pnpm --filter @atom63/ui-ios check:swift-tokens     # token sources → generated Swift tokens
pnpm check:agent-index                              # the CLI's generated index matches the sources
```

## Adding Or Promoting A Package

1. Add or update the package manifest.
2. Add public exports intentionally.
3. Document the consumer entry point in the package README, and add the package to the table in
   AGENTS.md.
4. Add Storybook stories when the package renders UI; every story gets render, axe and visual
   tests.
5. To publish it, follow "Adding a new package" in [release-automation.md](./release-automation.md).
6. Run the readiness checks above.

For `Atom63UI`, also run `swift test` from the repository root and
`node packages/ui-ios/Scripts/run-ios-tests.mjs`, as CI does.
