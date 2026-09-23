# Next beta release candidate

Status: prepared for approval; no versioning or publish has been run.

## Scope

This candidate exists to let `atom63-vite` validate the standalone design-system packages as its first real product consumer.

Planned package bumps:

| Package | Bump | Reason |
| --- | --- | --- |
| `@atom63/styles` | patch prerelease | Publish `--font-weight-medium: 500` from the shared token layer so `atom63.io` does not need an app-local DS fallback. |
| `@atom63/ui-react` | patch prerelease | Publish the first-use `Atom63Theme` boundary used by the public quickstart and website consumer path. |

`@atom63/ui-foundation` is not intentionally changed for this candidate.

## Release gate

Do not publish from this document alone. Before a real publish, confirm the exact prerelease versions after `changeset version`, registry/auth readiness, and the npm `beta` dist-tag target with YZ.

No stable/`latest` promotion is approved. `docs/design-system/stable-release-policy.json` still marks stable promotion as `stable-promotion-not-approved`.

## Required evidence before asking for publish approval

- `pnpm changeset status --verbose`
- `pnpm check:benchmark-parity`
- `pnpm check:stable-release-preflight`
- `pnpm check:dependency-version-policy`
- `pnpm check:visual-qa-matrix`
- `pnpm check:ui-react-exports`
- `pnpm check:ui-react-stable-actions`
- `pnpm check:ui-react-monitor-evidence`
- `pnpm --filter @atom63/styles generate:tokens`
- `pnpm --filter @atom63/styles check:tokens`
- `pnpm --filter @atom63/styles test`
- `pnpm --filter @atom63/ui-foundation build`
- `pnpm --filter @atom63/ui-react build`
- `pnpm check:ds-pack-smoke`
- `pnpm build:example:vite-basic`
- `pnpm build:example:product-shell`
- `git diff --check`

## Adopter validation after approved publish

After publish and registry readback, update the `atom63-vite` website published-DS smoke versions and run:

- `pnpm check:website-ds-consumer`
- `A63_USE_PUBLISHED_DS=1 pnpm --filter @atom63/website build`
- browser sanity for `/`, `/ds-lab`, and `/design-system` on mobile and desktop when practical.
