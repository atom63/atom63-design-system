# Atom63 DS Changesets Backlog Isolation Plan

**Status:** Planning only / no changeset files moved / no versioning / no publish  
**Decision owner:** YZ  
**Scope:** Isolate first-wave design-system beta versioning from the existing `.changeset` backlog.

This document records the current Changesets state and the safe path before any real `changeset version` or publish command. It does not authorize deleting, moving, consuming, or editing existing backlog changesets.

## Current status output

`pnpm changeset status --verbose` currently includes more than the approved first-wave packages:

| Package | Computed bump | Included in first-wave beta? | Source |
| --- | --- | --- | --- |
| `@atom63/styles` | minor | Yes | existing style changesets plus `.changeset/prepare-ds-public-beta.md` |
| `@atom63/ui-foundation` | patch | Yes | `.changeset/prepare-ds-public-beta.md` |
| `@atom63/ui-react` | minor | Yes | existing UI React changesets plus `.changeset/prepare-ds-public-beta.md` |
| `@atom63/ui-ios` | minor | No | `.changeset/control-rendered-size-vs-touch-target.md` |
| `@atom63/mdx` | patch | No | dependent bump computed by Changesets; no direct `.changeset/*.md` entry found in the current backlog inventory |

Because of the `@atom63/ui-ios` and `@atom63/mdx` entries, the current branch is not safe for direct `changeset version` execution.

## Direct non-first-wave source

The direct non-first-wave changeset that affects the DS beta status is:

| File | Non-first-wave package | Note |
| --- | --- | --- |
| `.changeset/control-rendered-size-vs-touch-target.md` | `@atom63/ui-ios` | Mixed changeset: also bumps `@atom63/styles` and `@atom63/ui-react`, which are first-wave packages. |

`@atom63/mdx` appears as a dependent patch bump in Changesets status. It should be investigated during the dry-run isolation step before versioning; do not assume it is safe to publish as part of the DS beta.

## Recommended isolation path

Use a dedicated DS release-prep branch or worktree where `.changeset` contains only release-approved DS beta intent.

1. Start from the current release-prep commit.
2. Preserve the existing backlog before touching it:
   - record the full `pnpm changeset status --verbose` output;
   - copy or commit an inventory of every backlog file and package bump;
   - do not delete backlog files from the main development branch.
3. In the dedicated DS release-prep branch only, isolate `.changeset/prepare-ds-public-beta.md` from unrelated backlog:
   - either temporarily move unrelated `.changeset/*.md` files to a clearly named holding directory outside `.changeset`, or
   - create the release branch from a point before those backlog changesets and apply only the DS release-prep changeset.
4. Run `pnpm changeset status --verbose` again.
5. Continue only if status contains exactly:
   - `@atom63/styles`
   - `@atom63/ui-foundation`
   - `@atom63/ui-react`
6. Re-run the full release preflight from the clean DS release-prep branch.
7. Ask YZ for a final versioning/publish approval with the clean status output attached.

## Do not use these shortcuts

- Do not run `changeset version` from the current branch.
- Do not publish `@atom63/ui-ios` or `@atom63/mdx` as part of the first-wave DS beta.
- Do not delete backlog changesets without a recovery branch or explicit YZ approval.
- Do not edit `.changeset/config.json` to hide the problem.
- Do not change release workflows to work around backlog contamination.

## Recommended next implementation

Prepare a non-destructive backlog inventory artifact that records every `.changeset/*.md` file, its package bumps, and whether it is first-wave, mixed, or non-first-wave. Then create a temporary DS release worktree to prove that isolating to `.changeset/prepare-ds-public-beta.md` yields a clean Changesets status before any versioning command is considered.

## Remaining blocker

The release-prep artifacts are valid, but actual versioning is blocked until the Changesets status can be made first-wave-only. The current status is useful evidence precisely because it prevents an accidental release of `@atom63/ui-ios` and `@atom63/mdx` with the DS beta.
