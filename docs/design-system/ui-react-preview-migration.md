# `@atom63/ui-react` Preview Migration

**Status:** beta/stable-readiness guidance; no root export removal in this document.

**Scope:** preview/experimental candidates that remain importable from the broad beta root but are now also available from `@atom63/ui-react/preview`.

## Summary

The beta package intentionally keeps the current broad root export to avoid adopter churn. Stable/latest should not treat low-level primitives, imperative handles, internal context helpers, raw styling helpers, conformance evidence, or raw motion constants as stable root API by default.

Use this rule:

- Keep core components and documented composition APIs from `@atom63/ui-react`.
- Move preview-only escape hatches to `@atom63/ui-react/preview` when adopting them intentionally.
- Do not rely on preview exports for long-term stable compatibility unless a later stable decision explicitly promotes that symbol.

## Root-to-preview examples

```tsx
// Beta root still works today, but this is not the preferred stable-ready shape.
import { DialogPrimitive } from '@atom63/ui-react'

// Preferred for preview/escape-hatch usage.
import { DialogPrimitive } from '@atom63/ui-react/preview'
```

```tsx
// Before: broad beta root import.
import { TooltipCreateHandle, TooltipPrimitive } from '@atom63/ui-react'

// After: explicitly preview-labeled import.
import { TooltipCreateHandle, TooltipPrimitive } from '@atom63/ui-react/preview'
```

```tsx
// Before: raw motion constants from the beta root.
import { ATOM63_MOTION_EASE, ATOM63_OVERLAY_MOTION_DURATION_MS } from '@atom63/ui-react'

// After: explicit preview import while token/style policy hardens.
import {
  ATOM63_MOTION_EASE,
  ATOM63_OVERLAY_MOTION_DURATION_MS,
} from '@atom63/ui-react/preview'
```

## Preview symbols

These symbols are **not stable-root-eligible by default**. They are public preview exports while the DS is in beta.

### Primitive aliases

- `AlertDialogPrimitive`
- `AutocompletePrimitive`
- `AvatarPrimitive`
- `DialogPrimitive`
- `InputPrimitive`
- `ProgressPrimitive`
- `SeparatorPrimitive`
- `SheetPrimitive`
- `TooltipPrimitive`

### Imperative handles

- `AlertDialogCreateHandle`
- `CommandCreateHandle`
- `DialogCreateHandle`
- `TooltipCreateHandle`

### Internal context and helpers

- `ButtonGroupProvider`
- `useButtonGroupContext`
- `cardLinkClassName`
- `navigationMenuTriggerStyle`
- `scrollableListControlClassNames`
- `selectTriggerDefaultClassName`

### Conformance evidence

- `getReactRendererConformance`
- `reactRendererConformance`
- `ReactRendererConformanceEvidence`
- `ReactVerifiedContractId`

### Motion constants

- `ATOM63_FLYOUT_TRANSITION`
- `ATOM63_FLYOUT_TRANSITION_CSS`
- `ATOM63_MOTION_EASE`
- `ATOM63_MOTION_EASE_CSS`
- `ATOM63_OVERLAY_MOTION_DURATION_CSS`
- `ATOM63_OVERLAY_MOTION_DURATION_MS`
- `ATOM63_OVERLAY_MOTION_EASE`
- `ATOM63_OVERLAY_MOTION_EASE_CSS`

## Stable/latest rule

Before stable/latest, each preview symbol must receive one explicit decision:

1. **Keep preview-only** — stays in `@atom63/ui-react/preview`, removed from stable root when root narrowing is approved.
2. **Promote to stable root** — requires design-engineering approval, docs, tests, and adopter evidence.
3. **Make private/remove** — if the symbol is implementation detail with no supported external use case.
4. **Move to a better boundary** — for example future `./tokens`, `./conformance`, or styling recipe documentation.

Until one of those happens, the stable action matrix should keep preview symbols as blockers for stable/latest promotion.

## Non-goals

- This does not remove root exports.
- This does not publish npm packages.
- This does not change `latest` or `beta` dist-tags.
- This does not resolve monitor-high-risk APIs such as Autocomplete, Calendar, Carousel, media/lightbox, or color extraction.
