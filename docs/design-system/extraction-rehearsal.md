# Atom63 DS Extraction Rehearsal

**Status:** Local rehearsal evidence / no publish  
**Date:** 2026-09-20  
**Scope:** First-wave design-system packages only: `@atom63/styles`, `@atom63/ui-foundation`, and `@atom63/ui-react`.

This rehearsal simulates a package consumer outside the monorepo. It does not create a repository split, change release configuration, add Changesets, push, or publish.

## Result

The external tarball consumer passed.

| Check | Result |
| --- | --- |
| `pnpm --filter @atom63/styles check:tokens` | Passed |
| `pnpm --filter @atom63/ui-foundation build` | Passed |
| `pnpm --filter @atom63/ui-react build` | Passed with the existing non-fatal bundled `"use client"` warning |
| External consumer install | Passed with `pnpm install --offline --no-frozen-lockfile` |
| External consumer check | Passed: `tsc --noEmit && vite build` |
| External build output | Vite transformed 3844 modules and produced a production bundle |
| Workspace aliases | None in the external consumer `package.json` |
| `@atom63/icons` dependency | `@atom63/ui-react` installed without a direct `@atom63/icons` dependency |

## Packed packages installed

| Package | Packed tarball | Installed version |
| --- | --- | --- |
| `@atom63/styles` | `atom63-styles-0.0.1.tgz` | `0.0.1` |
| `@atom63/ui-foundation` | `atom63-ui-foundation-0.1.0.tgz` | `0.1.0` |
| `@atom63/ui-react` | `atom63-ui-react-0.1.1.tgz` | `0.1.1` |

The consumer installed the tarballs by file path from a temporary repo. It imported:

- `@atom63/styles`
- `@atom63/ui-react/styles.css`
- `@atom63/ui-react/recipes/media-lightbox.css`
- root `@atom63/ui-react` components and types
- `@atom63/ui-react/layout`
- `@atom63/ui-react/media`
- `@atom63/ui-react/media/lightbox`
- `@atom63/ui-react/theme`
- `@atom63/ui-foundation` contracts and types

The rendered smoke app covered representative core controls and composition primitives: card, badge, label, input, textarea, checkbox, switch, select, tabs, empty state, and button.

## Notes and gaps

- The first rehearsal attempt passed the external consumer install/build path, but a post-check tried `require.resolve('@atom63/styles/package.json')`. That subpath is blocked by the package export map. The final verification reads installed manifests directly from `node_modules` instead. This is not a consumer build blocker, but it is a reminder that package metadata is not currently public as a `./package.json` subpath.
- The rehearsal is still local tarball evidence, not a real registry publish. It does not prove npm organization access, public-vs-restricted access, dist-tag behavior, provenance, or registry-side dependency resolution.
- Figma manual QA remains a separate blocker and is not covered by this rehearsal.
- Stable/latest promotion remains blocked by the beta access decision, exact prerelease versions, and YZ approval.

## Next step

The publish-readiness evidence is now strong enough to prepare an approval packet, but not to publish. Before creating a real Changeset or release configuration, YZ still needs to decide:

1. npm org / `@atom63` scope ownership;
2. public versus restricted access;
3. whether to add `publishConfig.access` and where;
4. exact beta prerelease versions and dist-tag;
5. whether Figma manual QA must happen before the first npm beta or before stable/latest.
