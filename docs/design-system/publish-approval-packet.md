# Atom63 DS First-Wave Public Beta Approval Packet

**Status:** Release preparation assembled / no publish authorized
**Decision owner:** YZ
**Release channel:** Public npm beta using the `beta` dist-tag
**Scope:** Preparation artifacts only. No versioning, publication, push, workflow change, or commit has been performed by this packet.

## Approved decisions

YZ approved the following release-preparation decisions:

- Prepare a public npm beta for the first-wave design-system packages.
- Use the npm `beta` dist-tag. Do not use or promote to `latest` in this release.
- Treat manual Figma QA as a blocker for stable/`latest`, not for the first npm beta.
- Follow the recommended version plan, with exact versions determined by a final Changesets dry-run before versioning.
- Continue release preparation without publishing.
- Set `publishConfig.access` to `public` in each first-wave package manifest. The repository-wide `.changeset/config.json` remains unchanged and still defaults to `restricted`.

These approvals authorize the files in this preparation slice. They do not authorize running versioning or publish commands.

## First-wave boundary

| Package | Current version | Changeset bump | Expected beta shape | Public-beta role |
| --- | --- | --- | --- | --- |
| `@atom63/styles` | `0.0.1` | minor | `0.1.0-beta.0` in prerelease mode, or `0.1.0` with the `beta` dist-tag without prerelease mode | CSS foundation, tokens, contracts, themes, and utilities |
| `@atom63/ui-foundation` | `0.1.0` | patch | `0.1.0-beta.0` or the next valid prerelease shape, depending on Changesets mode and current release state | Platform-neutral renderer contracts |
| `@atom63/ui-react` | `0.1.1` | minor | `0.2.0-beta.0` in the recommended prerelease shape | React runtime, components, layouts, media, and appearance UI |

The coordinated Changeset uses a patch for `@atom63/ui-foundation`: this slice exposes the existing contract package for beta without claiming a new contract family or breaking API. `@atom63/styles` and `@atom63/ui-react` use minor bumps because this is the first public foundation release and because the React package's public boundary, icon dependency, and root-support policy changed materially.

The table describes intent, not generated versions. Changesets prerelease state, existing versions, and internal dependency updates can affect the exact output. A final dry-run is required before any version files are changed.

### Explicitly excluded

- `@atom63/icons`; `@atom63/ui-react` uses `lucide-react` for default control icons and does not require the Atom63 icon package.
- `@atom63/agent`, `@atom63/widgets`, `@atom63/app-services`, and `@atom63/os63`.
- The Figma plugin, docs app, Storybook, examples, audit tooling, and QA harnesses.
- Every other workspace package unless a later approval explicitly expands the boundary.

## Evidence summary

| Evidence | Result | Reference |
| --- | --- | --- |
| Package metadata audit | The three first-wave packages have names, descriptions, MIT licenses, repository metadata, `files`, export maps, side-effect declarations, and dependency classifications. Dry-run packs contained 74 files for styles, 5 for foundation, and 92 for React at the time of audit. First-wave manifests now make public access explicit. | [Package metadata audit](./package-metadata-audit.md) |
| `ui-react` root API audit and inventory | The broad root and public subpaths are inventoried, drift-checkable, and governed by tiered beta support. No export change is part of this release-prep slice. | [`ui-react` root API audit](./ui-react-root-api-audit.md), [`ui-react` export inventory](./audits/ui-react-export-inventory.json) |
| Expanded packed-package smoke | The packed harness covers the three tarballs, representative core rendering, root types and components, layout, media, lightbox, theme, and selected higher-risk APIs; it typechecks and produces a Vite build without workspace source aliases. | `pnpm check:ds-pack-smoke`; [extraction rehearsal](./extraction-rehearsal.md) |
| Extraction rehearsal | A throwaway external consumer installed local tarballs for all three first-wave packages and passed `tsc --noEmit && vite build`. | [Extraction rehearsal](./extraction-rehearsal.md) |
| Vite example | The repository includes a minimal Vite adopter example and a dedicated build command for the supported install/import path. Refresh it in the final preflight. | `pnpm build:example:vite-basic` |
| Icon dependency boundary | The hard `@atom63/icons` dependency was removed from `@atom63/ui-react`; `lucide-react` is the default runtime icon dependency. | [Package metadata audit](./package-metadata-audit.md), [Publish boundary RFC](./publish-boundary-rfc.md) |

This evidence supports a beta candidate, not a stable compatibility promise or registry-side proof.

## Remaining risks and blockers

- npm organization ownership, `@atom63` scope permissions, account 2FA, publish-token permissions, and provenance configuration are not verified by repository checks. They must be confirmed by a human before publication.
- `.changeset/config.json` remains globally configured with `"access": "restricted"`. It is intentionally unchanged; the three first-wave manifests now override package access explicitly with `publishConfig.access: "public"`.
- Manual Figma QA is still incomplete or unrecorded. It does not block the first npm beta, but it blocks promotion to stable/`latest`.
- The broad `@atom63/ui-react` root remains a beta risk. The tiered support policy limits the promise, but the import surface is wider than the stable core and includes monitor/preview candidates.
- A local tarball rehearsal cannot prove registry-side access, dist-tag behavior, provenance, or dependency resolution. Those remain human-controlled publish-time checks.
- Exact prerelease numbers are not approved until the final Changesets dry-run is reviewed. In particular, `@atom63/ui-foundation` may need the next valid prerelease shape rather than `0.1.0-beta.0`.
- Current `pnpm changeset status` includes existing non-first-wave backlog (`@atom63/ui-ios` and `@atom63/mdx`) in addition to the approved first-wave packages. Do not run `changeset version` from this branch until that backlog is isolated, pruned, or moved to a dedicated non-DS release path. See [Changesets backlog isolation](./changesets-backlog-isolation.md).

## Required preflight before any publish

Run these from a clean, approved release worktree immediately before asking to execute versioning:

```bash
git status --short
pnpm check:lockfile-registry
pnpm check:ui-react-exports
pnpm check:token-manifest
pnpm check:ds-pack-smoke
pnpm build:example:vite-basic
pnpm check:app-consumption
pnpm --filter @atom63/styles test
pnpm --filter @atom63/ui-foundation typecheck
pnpm --filter @atom63/ui-react typecheck
pnpm --filter @atom63/ui-react test
```

Then perform a non-publishing Changesets dry-run or equivalent review that proves:

1. the exact versions Changesets would generate for all three packages;
2. the existing Changesets backlog is isolated so versioning includes only the approved first-wave packages, not unrelated packages such as `@atom63/ui-ios` or `@atom63/mdx`;
3. `@atom63/ui-react` resolves the intended beta versions of `@atom63/styles` and `@atom63/ui-foundation`;
4. only the three approved packages are included;
5. the publish command will use the `beta` dist-tag and public access;
6. npm scope access, 2FA/token policy, and provenance are ready.

Record the dry-run output for YZ. Do not turn the review into a real version or publish operation without the next human gate.

## Exact no-publish status

This worktree contains release-preparation metadata, documentation, and one coordinated Changeset only. The Changeset has not been consumed. Package versions have not been changed. Nothing has been published, pushed, committed, tagged, or promoted to `latest`.

The following actions remain forbidden until YZ gives a new, explicit approval after reviewing the final preflight and exact version output:

- `pnpm version-packages`
- `pnpm release`
- `changeset version` or `pnpm changeset version`
- `changeset publish` or `pnpm changeset publish`
- any `npm publish` or equivalent registry publication
- any push, release tag, or `latest` dist-tag change
- editing `.changeset/config.json` or `.github/workflows/*`

## Next human gate

Before an actual publish, YZ must review the refreshed preflight evidence and exact Changesets dry-run, verify npm scope/security/provenance readiness, and explicitly approve running the versioning and publish commands. Until that approval is recorded, stop at release preparation.

