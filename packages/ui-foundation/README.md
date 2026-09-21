# @atom63/ui-foundation

## What this package is

Platform-neutral TypeScript contracts for renderer authors and Atom63 design-system
maintainers. This package describes component variants, sizes, states, slots,
token slots, and personalization axes. It is not a UI runtime and renders
nothing by itself; React application authors should normally start with
`@atom63/ui-react`.

Built by You Zhang through Hermes Agent

## Install

The package name is `@atom63/ui-foundation`. Public npm availability is not
promised yet: the currently verified paths are a workspace dependency or a
locally packed tarball. Public publishing requires YZ approval and confirmation
of the npm organization policy.

After an approved public release, install by package name:

```sh
pnpm add @atom63/ui-foundation
```

Until then, use the workspace dependency:

```json
{
  "dependencies": {
    "@atom63/ui-foundation": "workspace:*"
  }
}
```

For a non-workspace consumer, pack the package and install the generated
`atom63-ui-foundation-*.tgz` file by path.

## Minimum setup

Import contracts from the package root. No provider, initialization, or DOM
setup is required.

## First contract usage

```ts
import { buttonContract, type ButtonContract } from '@atom63/ui-foundation'

const contract: ButtonContract = buttonContract

export const rendererDefaults = {
  size: contract.defaultSize,
  variant: contract.defaultVariant,
}
```

Use the exported readonly contract data to keep another renderer or design tool
aligned with Atom63. Do not mutate it or treat it as rendered component code.

## CSS imports

None. This package has no runtime side effects and ships TypeScript/JavaScript
contract data only. Use `@atom63/styles` for executable CSS.

## Theming

Themes are implemented by `@atom63/styles`. This package defines the shared
personalization-axis vocabulary, including theme and mode metadata, for code
that builds or validates renderers.

## Stable vs preview

The production consumption path is verified by `pnpm check:ds-pack-smoke`
against packed tarballs. Public publishing still requires YZ approval and npm
organization policy. Some contracts may remain preview while cross-renderer API
hardening continues; an exported contract is not automatically a stable public
commitment.

## Docs

- [Design system handbook](../../docs/design-system/README.md)
- [Cross-renderer contracts](../../docs/design-system/cross-renderer-contracts.md)
- [Production readiness audit](../../docs/design-system/production-readiness-audit.md)
