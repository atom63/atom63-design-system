# Release automation

Status: workflow scaffold added; npm trusted publisher setup is still required in npm web UI before using `publish=true`.

## Goals

- Avoid local long-lived npm publish tokens for future beta/stable releases.
- Publish from GitHub Actions with npm provenance/OIDC.
- Keep release execution manual until the beta process is mature.
- Prevent accidental republish when all package versions already exist on npm.

## Workflow

Manual workflow:

```txt
.github/workflows/release-beta.yml
```

Trigger from GitHub Actions with `workflow_dispatch`.

Inputs:

| Input | Default | Meaning |
| --- | --- | --- |
| `publish` | `false` | Run release preflight only. Set to `true` to publish unpublished versions. |

The workflow has two jobs:

1. `preflight`
   - installs with the pinned pnpm version
   - runs the DS verification gates
   - confirms Changesets prerelease mode is active with `tag: beta`
   - checks whether first-wave package versions are already published
2. `publish`
   - runs only when `publish=true`
   - uses `permissions.id-token: write`
   - runs in the `npm-publish` GitHub environment
   - publishes with `NPM_CONFIG_PROVENANCE=true`

## Required npm trusted-publisher setup

Before `publish=true` can work without an npm token, configure npm trusted publishing for each first-wave package:

| npm package | GitHub repository | Workflow file |
| --- | --- | --- |
| `@atom63/styles` | `ATOM63/atom63-design-system` | `.github/workflows/release-beta.yml` |
| `@atom63/ui-foundation` | `ATOM63/atom63-design-system` | `.github/workflows/release-beta.yml` |
| `@atom63/ui-react` | `ATOM63/atom63-design-system` | `.github/workflows/release-beta.yml` |

Recommended npm setting:

- allow staged publish if npm presents staged publishing as the default
- allow direct `npm publish` only if we intentionally keep this workflow as a direct beta publisher
- require package admin review in npm for permission changes

The workflow also references a GitHub environment named `npm-publish`. Create it in GitHub repo settings and add required reviewers before enabling direct publishing.

## How to cut a future beta

1. Land code/docs changes on `main` with a Changeset.
2. Run the version step locally or through a future version PR flow:

   ```bash
   pnpm changeset version
   ```

3. Review generated package versions and changelogs.
4. Commit and push the version commit.
5. Confirm CI is green.
6. Run **Release beta** with `publish=false` first.
7. If preflight is green and unpublished versions are expected, rerun **Release beta** with `publish=true`.
8. Read back npm registry state:

   ```bash
   npm view @atom63/styles@beta name version dist-tags --json
   npm view @atom63/ui-foundation@beta name version dist-tags --json
   npm view @atom63/ui-react@beta name version dist-tags dependencies --json
   ```

9. Run external/adopter smoke.

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
- The workflow does not create release PRs yet. A future improvement can add Changesets action or a dedicated version workflow.
- No npm token is stored in this repo. If trusted publisher is not configured in npm, `publish=true` should fail rather than falling back to a local token.
