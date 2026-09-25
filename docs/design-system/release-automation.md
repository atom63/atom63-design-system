# Release automation

Status: automated. A push to `main` opens a Version Packages pull request; merging it publishes to the npm `beta` tag through trusted publishing.

## Goals

- Avoid local long-lived npm publish tokens for future beta/stable releases.
- Publish from GitHub Actions with npm provenance/OIDC.
- Keep one human decision per release: merging the Version Packages pull request.
- Prevent accidental republish when all package versions already exist on npm.

## Workflow

```txt
.github/workflows/release-beta.yml
```

It runs on every push to `main` and on `workflow_dispatch`:

1. `detect` counts pending changesets (`.changeset/*.md`) and first-wave package versions that are not on npm yet.
2. `version-pr` runs on a push with pending changesets. It runs `pnpm release:version` (`changeset version` plus the audit regenerations the version bump requires), force-pushes the result to `changeset-release/main`, and opens or updates the **chore: version packages** pull request.
3. `preflight` runs when there are unpublished versions (or on `workflow_dispatch`): the full DS verification gates, pack and registry smoke, and the prerelease-mode check.
4. `publish` runs after a green preflight when there are unpublished versions on a push, or when `workflow_dispatch` sets `publish=true`. It uses `permissions.id-token: write`, runs in the `npm-publish` environment, and publishes with `NPM_CONFIG_PROVENANCE=true`.
5. `record-evidence` runs after a publish. It waits until the npm `beta` tag resolves to the published versions, regenerates `docs/design-system/audits/registry-consumer-smoke.json`, and commits it to `main`, so CI does not fail on evidence that still names the previous versions. Moving `latest` and updating `beta-release-notes.md` stay manual.

`workflow_dispatch` with `publish=false` remains a dry run of the preflight.

## Required npm trusted-publisher setup

Before `publish=true` can work without an npm token, configure npm trusted publishing for each published package (the list lives in `scripts/design-system/published-packages.mjs`). The owner and repository fields are case-sensitive: use lowercase `atom63`.

| npm package | GitHub repository | Workflow file |
| --- | --- | --- |
| `@atom63/styles` | `atom63/atom63-design-system` | `.github/workflows/release-beta.yml` |
| `@atom63/ui-foundation` | `atom63/atom63-design-system` | `.github/workflows/release-beta.yml` |
| `@atom63/ui-react` | `atom63/atom63-design-system` | `.github/workflows/release-beta.yml` |
| `@atom63/mdx` | `atom63/atom63-design-system` | `.github/workflows/release-beta.yml` |

A trusted publisher can only be added to a package that exists, so a new package needs one manual first publish. Then add it to the published-packages list and to `PUBLISHED_PACKAGES` in the workflow.

Recommended npm setting:

- allow staged publish if npm presents staged publishing as the default
- allow direct `npm publish` only if we intentionally keep this workflow as a direct beta publisher
- require package admin review in npm for permission changes

The workflow also references a GitHub environment named `npm-publish`. Create it in GitHub repo settings and add required reviewers before enabling direct publishing.

## How to cut a beta

1. Land changes on `main` with a changeset.
2. The workflow opens or updates the **chore: version packages** pull request. Review the versions and changelog entries.
3. Merge it. The workflow runs the preflight and publishes the new versions to `beta`. If the `npm-publish` environment has required reviewers, approve the deployment.
4. Read back npm registry state:

   ```bash
   npm view @atom63/styles@beta name version dist-tags --json
   npm view @atom63/ui-foundation@beta name version dist-tags --json
   npm view @atom63/ui-react@beta name version dist-tags dependencies --json
   npm view @atom63/mdx@beta name version dist-tags dependencies --json
   ```

5. Keep `latest` synchronized with `beta` (see caveats) and run external/adopter smoke.

## Stable/latest promotion policy

Stable/latest promotion is not approved yet. The source of truth is
[`stable-release-policy.json`](./stable-release-policy.json), and its generated
readback lives at [`audits/stable-release-preflight.json`](./audits/stable-release-preflight.json).

Run the no-publish stable preflight before discussing a stable promotion:

```bash
pnpm check:stable-release-preflight
```

The check is intentionally conservative:

- `latest` is the stable default install channel and is not allowed before all
  stable-readiness blockers are resolved.
- the preflight must remain `publishAllowed: false` until a separate human
  approval records the stable/latest decision.
- first-wave package versions are read from package manifests and recorded in a
  generated audit artifact.
- registry readback and rollback commands must stay documented before any
  stable/latest release can proceed.

Required stable registry readback after an approved promotion:

```bash
npm view @atom63/styles@latest name version dist-tags --json
npm view @atom63/ui-foundation@latest name version dist-tags --json
npm view @atom63/ui-react@latest name version dist-tags dependencies --json
```

Rollback is dist-tag first: move `latest` back to the previous approved stable
version or remove the accidental `latest` tag, then rerun registry readback and
adopter smoke. Do not unpublish unless npm support and package-policy review
approve it.

## Current caveats

- `latest` exists on the beta packages because the first manual npm publishes created it. The current mitigation is keeping `latest` synchronized with `beta`; stable/latest promotion remains not approved by policy.
- The workflow currently uses `changeset publish` through `pnpm release`. It should publish only package versions that are not already present in npm.
- The version pull request is created with `GITHUB_TOKEN`, so GitHub does not run CI on it. The version job regenerates every audit the checks compare, and the preflight runs again on the merge commit before anything publishes.
- The workflow does not move `latest`; synchronize it with `npm dist-tag add` after each publish while the beta policy keeps `latest` equal to `beta`.
- The repository setting **Allow GitHub Actions to create and approve pull requests** must be on for `version-pr` to open the pull request.
- No npm token is stored in this repo. If trusted publisher is not configured in npm, `publish=true` should fail rather than falling back to a local token.
