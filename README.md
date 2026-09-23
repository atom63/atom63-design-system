# Atom63 Design System

Atom63's first-wave design-system packages, extracted into a focused workspace for
release preparation and external-consumer verification.

## Packages

| Package | Purpose |
| --- | --- |
| `@atom63/styles` | CSS tokens, themes, contracts, and utilities |
| `@atom63/ui-foundation` | Platform-neutral TypeScript contracts and environment types |
| `@atom63/ui-react` | React components, layout primitives, media, and theme controls |
| `Atom63UI` (`packages/ui-ios`) | SwiftUI components generated from the same tokens, distributed with SwiftPM from the root `Package.swift` |

## Install

The first-wave packages are available as a public npm beta. Install from the
`beta` dist-tag:

```bash
pnpm add @atom63/styles@beta @atom63/ui-foundation@beta @atom63/ui-react@beta
```

Install only the packages a consumer needs, for example:

```bash
pnpm add @atom63/styles@beta @atom63/ui-react@beta
```

Start with the [public beta quickstart](./docs/design-system/quickstart.md) for
CSS imports, theme and mode attributes, a first component, preview policy, and
consumer verification. See [beta release notes](./docs/design-system/beta-release-notes.md)
for current versions, adopter evidence, and stable-readiness blockers. The
[support and governance policy](./docs/design-system/support-governance.md)
defines the beta support scope, compatibility tiers, reporting routes, and
human approval gates.

## Local development

Use Node.js 22 and the pnpm version pinned in `package.json`:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @atom63/ui-foundation dev
pnpm --filter @atom63/ui-react dev
pnpm --filter atom63-vite-basic-example dev
```

Run package watchers in separate terminals when developing against the example.

## Verification

```bash
pnpm check:ui-react-exports
pnpm --filter @atom63/styles check:tokens
pnpm --filter @atom63/ui-foundation build
pnpm --filter @atom63/ui-react build
pnpm check:ds-pack-smoke
pnpm build:example:vite-basic
pnpm --filter @atom63/styles test
pnpm --filter @atom63/ui-foundation typecheck
pnpm --filter @atom63/ui-react typecheck
pnpm --filter @atom63/ui-react test
pnpm changeset status --verbose
```

## Repository status

This repository is the extracted Atom63 Design System workspace. It is prepared for
public GitHub visibility, and the first-wave packages are published on npm under
the `beta` tag. Further versioning and publishing require separate approval. See
[the extracted-repository status](./docs/design-system/extracted-repo-status.md)
for the current package boundary and intended follow-up.

Built by You Zhang through Hermes Agent.
