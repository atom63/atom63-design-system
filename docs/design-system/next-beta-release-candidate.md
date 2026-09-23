# Next beta release candidate

Status: published to npm `beta`; post-publish adopter validation passed.

## Scope

This candidate exists to let `atom63-vite` validate the standalone design-system packages as its first real product consumer.

Versioned package output:

| Package | Version | Reason |
| --- | --- | --- |
| `@atom63/styles` | `0.1.0-beta.1` | Publish `--font-weight-medium: 500` from the shared token layer so `atom63.io` does not need an app-local DS fallback. |
| `@atom63/ui-react` | `0.2.0-beta.3` | Publish the first-use `Atom63Theme` boundary used by the public quickstart and website consumer path. |

`@atom63/ui-foundation` is not intentionally changed for this candidate.

## Release result

Published packages:

- `@atom63/styles@0.1.0-beta.1`
- `@atom63/ui-react@0.2.0-beta.3`

Registry dist-tags after cleanup:

- `@atom63/styles@beta` -> `0.1.0-beta.1`
- `@atom63/ui-react@beta` -> `0.2.0-beta.3`
- `@atom63/ui-foundation@beta` -> `0.1.1-beta.0`
- `latest` remains on the previous beta package versions; no stable/`latest` promotion is approved.

The first publish attempt through GitHub Actions proved the preflight but failed at the publish step because the workflow used token authentication that did not have npm scope publish permission. The packages were published manually with npm auth, then the workflow was updated to prefer trusted-publisher OIDC for future releases.

## Release gate

Future publishes should use the `Release beta` workflow after npm trusted publishers are configured for each package with GitHub Actions, workflow filename `release-beta.yml`, and environment `npm-publish`.

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
