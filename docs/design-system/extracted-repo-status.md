# Extracted repository status

## Current boundary

This repository is the focused Atom63 Design System extraction for the first public
beta package wave. It is allowed to be public on GitHub, but npm versioning,
publishing, release tags, and `latest` promotion still require separate approval.

The extraction contains only the first-wave public beta packages:

- `@atom63/styles`
- `@atom63/ui-foundation`
- `@atom63/ui-react`

The SwiftUI renderer `Atom63UI` (`packages/ui-ios`) and its catalog app
(`examples/ios-demo`) moved here from `atom63-vite` on 2026-09-23. SwiftPM consumers
resolve it from the root `Package.swift`; it is not published to npm.

Packages such as `@atom63/icons`, `@atom63/widgets`, `@atom63/agent`, and `@atom63/mdx` remain outside this repository's package boundary. Some imported
planning documents and changelog history still mention those packages as historical
context or future Layer 2 candidates; they are not source packages in this repo and
must not be published as part of the first beta.

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

## Public-readiness note

A local public-readiness audit found no tracked `.env` files, private keys, npm tokens,
GitHub tokens, tarball artifacts, `creative/`, or `apps/learn` source in this repo.
The remaining pre-publish blockers are registry-side: npm org permissions, 2FA/token
setup, final Changesets version output review, and explicit beta publish approval.
