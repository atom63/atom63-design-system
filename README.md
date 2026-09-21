# Atom63 Design System

Atom63's first-wave design-system packages, extracted into a focused workspace for
release preparation and external-consumer verification.

## Packages

| Package | Purpose |
| --- | --- |
| `@atom63/styles` | CSS tokens, themes, contracts, and utilities |
| `@atom63/ui-foundation` | Platform-neutral TypeScript contracts and environment types |
| `@atom63/ui-react` | React components, layout primitives, media, and theme controls |

## Install

The packages are not published yet. After an approved beta release, install them
from the npm `beta` dist-tag:

```bash
pnpm add @atom63/styles@beta @atom63/ui-foundation@beta @atom63/ui-react@beta
```

Install only the packages a consumer needs, for example:

```bash
pnpm add @atom63/styles@beta @atom63/ui-react@beta
```

Do not copy these commands into production setup until the beta packages exist.

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

This repository is a local-only extraction. It has no Git remote, and no versioning,
publishing, or GitHub repository creation is authorized. See
[the extracted-repository status](./docs/design-system/extracted-repo-status.md) for
the current boundary and intended follow-up.

Built by You Zhang through Hermes Agent.
