# Extracted repository status

## Current boundary

This repository is a local-only extraction for private GitHub bootstrap preparation.
It has no Git remote and must not be pushed, published, versioned with Changesets, or
used to create a GitHub repository without a separate approval.

The extraction contains only the first-wave public beta packages:

- `@atom63/styles`
- `@atom63/ui-foundation`
- `@atom63/ui-react`

Packages such as `@atom63/icons`, `@atom63/widgets`, `@atom63/agent`, `@atom63/mdx`,
and `@atom63/ui-ios` remain outside this repository's package boundary.

## Intended follow-up

After publication is separately approved and completed, `atom63-vite` should consume
the published first-wave packages from the npm `beta` dist-tag instead of relying on
workspace source packages. That migration belongs in `atom63-vite`, not in this
extracted repository.

## Copied Vite configuration

`config/vite/shared-app-config.ts` is legacy configuration copied from `atom63-vite`.
No current workspace file imports it, and its app aliases point to packages outside
this extraction. It remains temporarily because the private `@atom63/vite-config`
package still exports it while also housing `vitest-defaults.ts`, which the current
package tests import. Do not use the app config as an extracted-repository dependency;
remove or reshape the private config package in a dedicated cleanup.
