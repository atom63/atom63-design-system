# @atom63/ui-react Stable Promotion Action Matrix

**Status:** generated stable-readiness planning artifact; no export changes.

**Source of truth:** `docs/design-system/audits/ui-react-export-inventory.json`, `docs/design-system/ui-react-support-policy.json`

## Summary

- Root export symbols: **597** across **74** source families.
- Package export-map subpaths: **70**.
- P0 root/source families: **31**.
- P1 root/source families: **12**.
- P0 package subpaths: **2**.
- P1 package subpaths: **2**.

### Root export tier counts

- `beta-supported-composition-conditional`: 179
- `beta-supported-core`: 311
- `monitor-high-risk`: 76
- `preview-experimental-candidate`: 31

## P0: must resolve before stable/latest

| Family                            | Priority | Action                       | Exports | Tier mix                                                                                   | Stable decision                                                                                                               |
| --------------------------------- | -------- | ---------------------------- | ------: | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `components/animated-check`       | P0       | `assign-owner-and-evidence`  |       2 | `monitor-high-risk`: 2                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/autocomplete`         | P0       | `assign-owner-and-evidence`  |      19 | `monitor-high-risk`: 18<br>`preview-experimental-candidate`: 1                             | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/calendar`             | P0       | `assign-owner-and-evidence`  |       2 | `monitor-high-risk`: 2                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/card`                 | P0       | `assign-owner-and-evidence`  |      30 | `beta-supported-core`: 25<br>`monitor-high-risk`: 4<br>`preview-experimental-candidate`: 1 | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/carousel`             | P0       | `assign-owner-and-evidence`  |       8 | `monitor-high-risk`: 8                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/copy-button`          | P0       | `assign-owner-and-evidence`  |       4 | `monitor-high-risk`: 4                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/destination-link`     | P0       | `assign-owner-and-evidence`  |       4 | `monitor-high-risk`: 4                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/input-otp`            | P0       | `assign-owner-and-evidence`  |       4 | `monitor-high-risk`: 4                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/load-more-trigger`    | P0       | `assign-owner-and-evidence`  |       4 | `monitor-high-risk`: 4                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/marquee`              | P0       | `assign-owner-and-evidence`  |       2 | `monitor-high-risk`: 2                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/panel-setting-button` | P0       | `assign-owner-and-evidence`  |       2 | `monitor-high-risk`: 2                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/portal-container`     | P0       | `assign-owner-and-evidence`  |       4 | `monitor-high-risk`: 4                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/progressive-blur`     | P0       | `assign-owner-and-evidence`  |       3 | `monitor-high-risk`: 3                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/text-ticker`          | P0       | `assign-owner-and-evidence`  |       2 | `monitor-high-risk`: 2                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `hooks/use-extract-color`         | P0       | `assign-owner-and-evidence`  |       3 | `monitor-high-risk`: 3                                                                     | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `lib/extract-color`               | P0       | `assign-owner-and-evidence`  |      10 | `monitor-high-risk`: 10                                                                    | Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded. |
| `components/alert-dialog`         | P0       | `move-to-preview-or-approve` |      18 | `beta-supported-core`: 16<br>`preview-experimental-candidate`: 2                           | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/avatar`               | P0       | `move-to-preview-or-approve` |       9 | `beta-supported-core`: 8<br>`preview-experimental-candidate`: 1                            | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/button-group`         | P0       | `move-to-preview-or-approve` |       7 | `beta-supported-core`: 5<br>`preview-experimental-candidate`: 2                            | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/command`              | P0       | `move-to-preview-or-approve` |      19 | `beta-supported-composition-conditional`: 18<br>`preview-experimental-candidate`: 1        | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/dialog`               | P0       | `move-to-preview-or-approve` |      19 | `beta-supported-core`: 17<br>`preview-experimental-candidate`: 2                           | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/input`                | P0       | `move-to-preview-or-approve` |      17 | `beta-supported-core`: 16<br>`preview-experimental-candidate`: 1                           | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/navigation-menu`      | P0       | `move-to-preview-or-approve` |      12 | `beta-supported-composition-conditional`: 11<br>`preview-experimental-candidate`: 1        | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/progress`             | P0       | `move-to-preview-or-approve` |       6 | `beta-supported-core`: 5<br>`preview-experimental-candidate`: 1                            | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/scrollable-list`      | P0       | `move-to-preview-or-approve` |       3 | `beta-supported-core`: 2<br>`preview-experimental-candidate`: 1                            | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/select`               | P0       | `move-to-preview-or-approve` |      12 | `beta-supported-core`: 11<br>`preview-experimental-candidate`: 1                           | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/separator`            | P0       | `move-to-preview-or-approve` |       3 | `beta-supported-core`: 2<br>`preview-experimental-candidate`: 1                            | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/sheet`                | P0       | `move-to-preview-or-approve` |      21 | `beta-supported-core`: 20<br>`preview-experimental-candidate`: 1                           | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `components/tooltip`              | P0       | `move-to-preview-or-approve` |       9 | `beta-supported-core`: 7<br>`preview-experimental-candidate`: 2                            | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `conformance`                     | P0       | `move-to-preview-or-approve` |       4 | `preview-experimental-candidate`: 4                                                        | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |
| `lib/motion`                      | P0       | `move-to-preview-or-approve` |       8 | `preview-experimental-candidate`: 8                                                        | Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.                  |

### P0 public subpaths

| Subpath            | Kind   | Priority | Action                                 | Stable decision                                                                                   |
| ------------------ | ------ | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `./media`          | module | P0       | `keep-preview-subpath-or-add-evidence` | Do not promise stable compatibility without browser/media lifecycle evidence or preview labeling. |
| `./media/lightbox` | module | P0       | `keep-preview-subpath-or-add-evidence` | Do not promise stable compatibility without browser/media lifecycle evidence or preview labeling. |

## P1: document or prove before stable/latest

| Family                        | Priority | Action                   | Exports | Tier mix                                     | Stable decision                                                                                                        |
| ----------------------------- | -------- | ------------------------ | ------: | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `components/connected-panel`  | P1       | `document-before-stable` |      12 | `beta-supported-composition-conditional`: 12 | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/context-menu`     | P1       | `document-before-stable` |      20 | `beta-supported-composition-conditional`: 20 | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/dropdown-menu`    | P1       | `document-before-stable` |      20 | `beta-supported-composition-conditional`: 20 | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/empty`            | P1       | `document-before-stable` |       8 | `beta-supported-composition-conditional`: 8  | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/feedback-state`   | P1       | `document-before-stable` |       5 | `beta-supported-composition-conditional`: 5  | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/frame`            | P1       | `document-before-stable` |       8 | `beta-supported-composition-conditional`: 8  | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/hover-card`       | P1       | `document-before-stable` |       4 | `beta-supported-composition-conditional`: 4  | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/item`             | P1       | `document-before-stable` |      13 | `beta-supported-composition-conditional`: 13 | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/menubar`          | P1       | `document-before-stable` |      18 | `beta-supported-composition-conditional`: 18 | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/preview-card`     | P1       | `document-before-stable` |       4 | `beta-supported-composition-conditional`: 4  | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/sidebar`          | P1       | `document-before-stable` |      28 | `beta-supported-composition-conditional`: 28 | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |
| `components/sidebar-nav-tree` | P1       | `document-before-stable` |      10 | `beta-supported-composition-conditional`: 10 | Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable. |

### P1 public subpaths

| Subpath    | Kind   | Priority | Action                      | Stable decision                                                                             |
| ---------- | ------ | -------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| `./layout` | module | P1       | `document-subpath-contract` | Keep public, but document supported high-level APIs versus monitored helpers before stable. |
| `./theme`  | module | P1       | `document-subpath-contract` | Keep public, but document supported high-level APIs versus monitored helpers before stable. |

## P2: stable candidates after standard QA

P2 entries are not expanded here to keep the stable-readiness page focused. See the machine-readable JSON matrix for the full list:

`docs/design-system/audits/ui-react-stable-action-matrix.json`

## How to update

Run:

```bash
pnpm check:ui-react-exports --write
pnpm check:ui-react-stable-actions --write
```

CI should run the same checks without `--write` and fail if either generated artifact drifts.
