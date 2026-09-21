# React-first design system — status

> **Historical checkpoint (2026-07-16), updated for iOS runtime work on
> 2026-08-19.** The “3 control archetypes” section is
> stale — `@atom63/ui-react` now ships a full component set (~68). For current
> authoring rules see [authoring-surfaces.md](./authoring-surfaces.md); for
> live docs see `apps/design-system`. Do not treat the component list below as
> an inventory of what exists today.

**As of 2026-07-16.** A parallel, executable, React-first design system built
beside production `@atom63/tokens` / `@atom63/ui` **without disturbing them**. North
star: `docs/design-system/react-first-executable-design-system.md` — React is the
design medium; one token/contract foundation drives web + iOS (+ future targets)
via a `designLanguage` switch. This document is a checkpoint of what exists.

## Packages (all new, parallel to production)

| package | role |
| --- | --- |
| `@atom63/styles` | CSS-only foundation: tokens → semantic layer (`--a63-*`) → contracts → themes. Tailwind + shadcn are **opt-in adapters** that only re-reference the canonical tokens (the "mirror rule"). |
| `@atom63/ui-foundation` | Framework-agnostic contracts + the personalization-axes SSOT (`axes.ts`) and environment types. |
| `@atom63/ui-react` | React renderer — components built on Base UI (`@base-ui/react`) + the recipe CSS. |
| `Atom63UI` (`packages/ui-ios`) | Native Swift Package with generated shared tokens plus SwiftUI Button, TextField, and Toggle implementations. |

## Components built (3 control archetypes)

1. **Button** — the *raised* action. 8 variants, 10 sizes, gloss/highlight/press
   capability tokens; matches production `@atom63/ui` closely.
2. **Input / TextField (+ InputGroup)** — the *recessed* entry. Base UI two-part
   anatomy (control chrome + field); `InputGroup` adds composable leading/trailing
   addons (icon, button, prefix text) sharing one chrome.
3. **Switch** — the *selection* archetype. Base UI Root+Thumb; the strongest
   iOS-vs-web design-language proof (a `--a63-switch-thumb-size` token that iOS
   enlarges). Ships a shared **selection contract** ready for Checkbox + Radio.

## Personalization axes (SSOT: `ui-foundation/axes.ts`)

designLanguage (web/ios) · mode (light/dark/system) · theme (modern/aqua/retro/
terminal) · brand (b1–b6) · input (touch/pointer/keyboard) · density
(compact/comfortable) · surface palette (n1–n6) + surface-tint scalar · system
(catalog-only). Each stamps a `data-a63-*` attribute via `UIProvider`
(inherit-not-reset). Four themes are lean value-override files; the accent follows
the brand ramp, so a control's "primary"/"on" color tracks brand **and** theme.

## Core architectural rules (learned, load-bearing)

- **Resolve at the use-site, not `:root`.** A `var()` inside a custom property
  resolves where the property is *declared*, then inherits as a resolved value.
  Component recipes therefore read mode/theme/brand-dependent tokens **on the
  component element** (e.g. `.a63-Input`), never through a `:root`-declared contract
  var — otherwise they freeze to the root's axis state. Contracts declare only
  axis-independent defaults; recipes use `var(--a63-x, <live semantic>)`.
- **Per-element/dynamic effects compose in the recipe**, not in theme tokens (a
  theme token on the shell can't see element-local vars).
- **Mirror rule:** adapters (tailwind/compat/shadcn) only re-reference canonical
  `--a63-*`; they never recompute.
- **oklch hue care:** mixing a status color with a neutral in oklch can swing
  through an unintended hue (magenta) on the shortest path — mix toward transparent
  to stay hue-stable.

## How to run

```
pnpm --filter @atom63/storybook dev      # http://localhost:7006
```
Stories live under **`2 — UI React/*`** (Button, Input, Switch). The toolbar drives
theme / brand / surface-tint live; each component has an Environment (web/iOS ×
light/dark), Themes, and BrandRamps story.

## What's next (not built)

- **Checkbox + Radio** — reuse the shipped selection contract.
- Overlay surfaces (Select/Popover/Tooltip) — a genuinely new dimension.
- Per-theme flourishes deferred on Switch (aqua gloss thumb, retro square).
- android/desktop design-language recipes; expand the SwiftUI renderer beyond the initial controls.
- Eventual migration story for production `@atom63/ui` (not started by design).

## Specs

`docs/superpowers/specs/` — one design doc per phase (styles consolidation, button
parity + brand axis, platform recipe proof, input/textfield, switch/selection).
