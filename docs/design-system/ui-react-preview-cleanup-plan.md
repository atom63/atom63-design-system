# @atom63/ui-react Preview-symbol Cleanup Plan

**Status:** Slice A implemented; the non-breaking `@atom63/ui-react/preview` boundary is available while current root exports remain unchanged.

**Scope:** `preview-experimental-candidate` root exports from `docs/design-system/ui-react-support-policy.json` and `docs/design-system/audits/ui-react-export-inventory.json`.

**Goal:** before stable/latest, make sure no implementation detail, upstream primitive alias, conformance artifact, or raw motion constant silently becomes part of the stable root compatibility promise.

## Summary

The current beta root intentionally stays broad. Stable/latest should not promise all preview candidates as stable root API.

Current preview candidates:

- **31 root symbols** across **17 source groups**.
- All are importable in beta today.
- Stable must choose one of:
  - move to an explicit preview/experimental boundary,
  - make private/remove from stable root with migration notes,
  - or explicitly approve as stable API.

## Recommended stable strategy

Do this in two non-breaking beta slices before any stable/latest release:

1. **Introduce `@atom63/ui-react/preview`**
   - Re-export the preview candidates from a clearly labeled preview subpath.
   - Document that preview exports are public but not covered by stable compatibility.
   - Keep the broad root temporarily during beta to avoid sudden adopter churn.

2. **Narrow the stable root before stable/latest**
   - Remove preview candidates from root for the stable channel unless explicitly approved.
   - Keep `./preview` for migration if those APIs still have real users.
   - Publish migration notes that map each old root import to either `@atom63/ui-react/preview`, a supported stable replacement, or removal/private status.

## Decision matrix

| Group | Symbols | Recommended stable action | Rationale |
| --- | --- | --- | --- |
| Upstream primitive aliases | `AlertDialogPrimitive`, `AutocompletePrimitive`, `AvatarPrimitive`, `DialogPrimitive`, `InputPrimitive`, `ProgressPrimitive`, `SeparatorPrimitive`, `SheetPrimitive`, `TooltipPrimitive` | Move to `./preview` or remove from stable root. | These expose Base UI/Radix-like upstream semantics through Atom63. They are useful escape hatches, but freezing them makes upstream behavior and type drift an Atom63 compatibility problem. |
| Imperative handle factories | `AlertDialogCreateHandle`, `CommandCreateHandle`, `DialogCreateHandle`, `TooltipCreateHandle` | Move to `./preview`; approve individually only when a documented composition needs them. | Imperative handles are hard to evolve safely and can couple adopters to internal focus/open-state machinery. |
| Internal provider/context escape hatches | `ButtonGroupProvider`, `useButtonGroupContext` | Prefer private. Move to `./preview` only if external composition needs them. | Consumers should compose through `ButtonGroup`, `ButtonGroupSeparator`, and documented children rather than binding to internal context shape. |
| Styling helper constants | `cardLinkClassName`, `navigationMenuTriggerStyle`, `scrollableListControlClassNames`, `selectTriggerDefaultClassName` | Prefer private or move to a future styling/recipes boundary, not stable root. | Raw class-name helpers leak implementation details and can block CSS architecture changes. Stable styling API should be CSS entries, recipes, tokens, or documented class contracts. |
| Conformance evidence | `getReactRendererConformance`, `reactRendererConformance`, `ReactRendererConformanceEvidence`, `ReactVerifiedContractId` | Remove from stable root; consider a dedicated `./conformance` or internal test-only boundary if needed. | Useful for DS maintainers and cross-renderer validation, but not a runtime component API. |
| Motion constants | `ATOM63_FLYOUT_TRANSITION`, `ATOM63_FLYOUT_TRANSITION_CSS`, `ATOM63_MOTION_EASE`, `ATOM63_MOTION_EASE_CSS`, `ATOM63_OVERLAY_MOTION_DURATION_CSS`, `ATOM63_OVERLAY_MOTION_DURATION_MS`, `ATOM63_OVERLAY_MOTION_EASE`, `ATOM63_OVERLAY_MOTION_EASE_CSS` | Prefer moving to styles/tokens or private implementation; `./preview` only if adopters need raw constants. | Motion should primarily be consumed via CSS variables/tokens and component behavior. Raw constants in root encourage implementation coupling. |

## Exact symbol checklist

### Move to `./preview` by default

These are useful escape hatches, but should not be stable root API by default:

- `AlertDialogPrimitive`
- `AutocompletePrimitive`
- `AvatarPrimitive`
- `DialogPrimitive`
- `InputPrimitive`
- `ProgressPrimitive`
- `SeparatorPrimitive`
- `SheetPrimitive`
- `TooltipPrimitive`
- `AlertDialogCreateHandle`
- `CommandCreateHandle`
- `DialogCreateHandle`
- `TooltipCreateHandle`

### Prefer private / remove from stable root

These should not remain stable root API unless a concrete adopter need appears:

- `ButtonGroupProvider`
- `useButtonGroupContext`
- `cardLinkClassName`
- `navigationMenuTriggerStyle`
- `scrollableListControlClassNames`
- `selectTriggerDefaultClassName`
- `getReactRendererConformance`
- `reactRendererConformance`
- `ReactRendererConformanceEvidence`
- `ReactVerifiedContractId`

### Resolve through tokens/styles before stable

These should become styles/tokens or stay private implementation details rather than stable root API:

- `ATOM63_FLYOUT_TRANSITION`
- `ATOM63_FLYOUT_TRANSITION_CSS`
- `ATOM63_MOTION_EASE`
- `ATOM63_MOTION_EASE_CSS`
- `ATOM63_OVERLAY_MOTION_DURATION_CSS`
- `ATOM63_OVERLAY_MOTION_DURATION_MS`
- `ATOM63_OVERLAY_MOTION_EASE`
- `ATOM63_OVERLAY_MOTION_EASE_CSS`

## Proposed implementation slices

### Slice A — add preview boundary without narrowing root

**Implemented:** all 31 preview candidates are available from `@atom63/ui-react/preview`; packed-consumer coverage verifies representative values and types. The broad beta root remains unchanged.

Files likely involved:

- `packages/ui-react/src/preview/index.ts`
- `packages/ui-react/package.json`
- `scripts/design-system/smoke-packed-ui-react.mjs`
- docs under `docs/design-system/`

Actions:

1. Add `./preview` to the package export map.
2. Re-export all preview candidates from `src/preview/index.ts`.
3. Add packed-consumer smoke imports from `@atom63/ui-react/preview`.
4. Document that preview exports are importable but not stable-compatibility promises.
5. Keep the current beta root unchanged in this slice.

Verification:

```bash
pnpm check:ui-react-exports
pnpm check:ui-react-stable-actions
pnpm --filter @atom63/ui-react build
pnpm check:ds-pack-smoke
pnpm build:example:vite-basic
```

### Slice B — add migration docs and deprecation language

Files likely involved:

- `docs/design-system/ui-react-root-api-audit.md`
- `docs/design-system/ui-react-support-policy.json`
- `docs/design-system/beta-release-notes.md`

Actions:

1. Document root import migration examples:
   - `import { DialogPrimitive } from '@atom63/ui-react'`
   - to `import { DialogPrimitive } from '@atom63/ui-react/preview'`
2. Mark root preview candidates as not stable-eligible.
3. Decide whether docs should call this “preview” or “experimental”; prefer **preview** because it is less throwaway and matches DS ecosystem language.

### Slice C — stable root narrowing, only when stable/latest is near

Do not do this until stable release planning is explicit.

Actions:

1. Remove unapproved preview candidates from root.
2. Keep `./preview` imports working.
3. Publish migration notes and changelog.
4. Re-run adopter branch against the narrowed root.

## Non-goals

- This plan does not touch `monitor-high-risk` APIs such as Autocomplete, Carousel, Calendar, color extraction, or media/lightbox. Those need a separate owner/evidence plan.
- This plan does not publish npm packages.
- This plan does not change stable/latest dist-tags.
- This plan does not decide Figma plugin/runtime behavior.

## Stable blocker this resolves

This resolves the planning blocker: “Preview/experimental candidates are identified, categorized, and mapped to a stable-readiness action.”

It does **not** complete stable readiness until Slice A/B/C decisions are implemented and verified.
