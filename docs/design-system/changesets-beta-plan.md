# Atom63 DS Changesets Beta Plan

**Status:** Coordinated Changeset prepared / not executed / no publish
**Decision owner:** YZ  
**Scope:** Release preparation for the first-wave design-system beta. The coordinated Changeset and explicit public package access are approved artifacts; version changes, release configuration changes, and publication are not authorized.

## First-wave scope

The coordinated beta covers:

- `@atom63/styles`
- `@atom63/ui-foundation`
- `@atom63/ui-react`

`@atom63/icons` is explicitly outside the first wave. `@atom63/ui-react` now uses `lucide-react` for default control icons, so an Atom63 icon package is not required for external consumption. Do not add `@atom63/icons` to first-wave Changesets unless Atom63 later decides to ship and support an icon library.

## Current release posture

- The root already provides `pnpm changeset`, `pnpm version-packages`, and `pnpm release`.
- `.changeset/config.json` currently sets `access` to `restricted` and has an ignore list. This plan does not change either setting; each first-wave manifest explicitly overrides package access with `publishConfig.access: "public"`.
- `.github/workflows/publish.yml` maintains the Version Packages PR. It does not publish to a registry.
- Manual slides, deck, and resume release paths are separate from this DS first wave and do not authorize a design-system publish.

## Proposed package order

1. `@atom63/styles` first. It is the CSS and token foundation consumed by the React package.
2. `@atom63/ui-foundation` second. Its current manifest has no dependency on `@atom63/styles`; the order is architectural, not a package-manager dependency requirement.
3. `@atom63/ui-react` last. Its current manifest directly depends on both `@atom63/styles` and `@atom63/ui-foundation`, so its packed dependency versions must resolve to the approved beta releases.

Re-check all three manifests immediately before execution. If their dependency graph changes, update this order and the coordinated Changeset summary before versioning.

## Version and release channel proposal

- Use the npm `beta` dist-tag for the first publication. The recommended execution path uses prerelease versions; do not publish the first beta under `latest`.
- The coordinated Changeset uses minor bumps for `@atom63/styles` and `@atom63/ui-react`, and a patch bump for `@atom63/ui-foundation`. Expected shapes are `0.1.0-beta.0` for styles, the next valid `0.1.x-beta.0` shape for foundation, and `0.2.0-beta.0` for React when prerelease mode is used. Exact output requires a final dry-run because Changesets mode and current release state determine the generated versions.
- Do not run `changeset version`, `changeset publish`, `pnpm version-packages`, or `pnpm release` from this plan.

## Coordinated Changeset

The release-prep artifact is [`.changeset/prepare-ds-public-beta.md`](../../.changeset/prepare-ds-public-beta.md). A single record keeps the dependency update order and the three-package release intent legible. Do not consume it with a version command until the final human gate.

The coordinated summary should cover the package-specific work without promising equal stability for every export:

| Package | Proposed summary |
| --- | --- |
| `@atom63/styles` | Prepare public-beta metadata and package README quickstart; verify packed CSS/token contents, token manifest output, and external Vite consumption. |
| `@atom63/ui-foundation` | Prepare public-beta metadata and package README quickstart for the typed renderer contracts; verify its independent packed artifact and consumer use. |
| `@atom63/ui-react` | Prepare public-beta metadata, package README quickstart, external packed smoke, and Vite example; harden default icon dependencies around `lucide-react`; document the broad root export inventory and tiered beta support policy without export churn. |

This table explains the coordinated summary. The Changeset records bump intent only; it does not establish exact prerelease numbers and has not been executed.

## Approval gates

YZ has approved the `beta` dist-tag, public access, the recommended bump plan, and preparation of the coordinated Changeset. Before any versioning or publish action, YZ must still approve:

- the exact prerelease versions shown by the final Changesets dry-run;
- verified ownership and administration of the npm organization and `@atom63` scope;
- 2FA/token/provenance readiness;
- the first real publish.

There is no implied approval to promote a beta to `latest`.

## Pre-execution checklist

Run or refresh this evidence immediately before asking for execution approval:

- [ ] `pnpm check:ui-react-exports`
- [ ] `pnpm check:ds-pack-smoke`
- [ ] `pnpm build:example:vite-basic`
- [ ] `pnpm check:token-manifest`
- [ ] Confirm the package metadata, `files`, export maps, dependency declarations, and dry-run packed contents are current for all three packages.
- [ ] Record the separate manual Figma QA before stable/`latest`; it does not block the first npm beta and is not replaced by package automation.
- [ ] Reconfirm npm scope ownership, 2FA/token/provenance readiness, and exact prerelease versions with YZ.

## Recommended next implementation

Refresh the extraction rehearsal in a throwaway external repository before executing the prepared Changeset. Pack the three packages locally, install the tarballs in dependency order, and build and typecheck the minimal Vite consumer without workspace aliases. Record any hidden workspace dependency, missing packed file, CSS import, or registry-resolution failure in the metadata audit. Keep the rehearsal local: it must not alter release configuration or publish artifacts.

Current evidence: [extraction-rehearsal.md](./extraction-rehearsal.md) records a passing local external-repo tarball rehearsal for the first-wave packages.

The single coordinated Changeset is now prepared for review. Run no Changesets version, prerelease, or publish command until the final preflight is clean and YZ approves the exact execution.

## Remaining decision

The largest unresolved issue is registry-side readiness and Changesets backlog isolation: repository checks cannot verify npm scope ownership, 2FA/token permissions, provenance, or the exact version output, and current `pnpm changeset status` includes existing non-first-wave packages (`@atom63/ui-ios`, `@atom63/mdx`). Follow [changesets-backlog-isolation.md](./changesets-backlog-isolation.md) before any versioning command. `.changeset/config.json` remains restricted globally, while the three approved manifests explicitly declare public access. No versioning or publish command should run until the dry-run proves only the approved first-wave packages are included and registry checks receive YZ's approval.

## Related documents

- [Publish boundary RFC](./publish-boundary-rfc.md)
- [Package metadata audit](./package-metadata-audit.md)
- [`@atom63/ui-react` root API support audit](./ui-react-root-api-audit.md)
- [First-wave public beta approval packet](./publish-approval-packet.md)
- [Changesets backlog isolation](./changesets-backlog-isolation.md)
