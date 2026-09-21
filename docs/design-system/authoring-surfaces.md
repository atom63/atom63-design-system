# Authoring surfaces & value ownership

Canonical human/agent guide for *where* to change Atom63 styles.
Architecture detail: [`packages/styles/README.md`](../../packages/styles/README.md).
Axes: [`personalization-axes.md`](./personalization-axes.md).
Public craft page (same workflow): design-system → Foundation → Designing in code.

## Which doc wins

If two docs disagree, prefer this file for **where to edit** and **value ownership**.
Then:

| Concern | Canonical |
| --- | --- |
| **Start here** (humans + agents) | [`README.md`](./README.md) in this folder |
| Authoring lanes / shared vs theme-private values | **This file** |
| Literal drift / deferred harden | [`foundation-value-drift.md`](./foundation-value-drift.md) |
| Axis ownership (`data-a63-*`) | [`personalization-axes.md`](./personalization-axes.md) + `ui-foundation/axes.ts` |
| Theme file guardrails | [`theme-authoring.md`](./theme-authoring.md) |
| Layer / package map | design-system Architecture pages + `packages/styles/README.md` |
| Live color cheat sheet | design-system → Foundation → Colors / Designing in code |
| Historical checkpoints | [`react-first-status.md`](./react-first-status.md), [`component-theme-contract.md`](./component-theme-contract.md) (archived banner) |

`component-theme-contract.md` and archived package names in older notes are **not** current policy.

## Core vs endpoint

| Question | Edit here | Do not edit here |
| --- | --- | --- |
| What is a **shared** scale step (palette, space, radius, type, blur, generic shadow)? | **Foundation** `tokens/foundation/*` | Semantics, contracts, recipes, adapters |
| What *role* should product UI use? | **Semantics / brand** `--a63-*` (+ shadcn/Tailwind aliases) | Foundation ramps, contract gloss knobs |
| How should a whole control family share geometry/material hooks? | **Contracts** (alias/remap; defaults may compose foundation) | New shared hex/oklch/rem **scales** |
| How should Aqua/Retro/Terminal feel? | **Themes** under `[data-a63-theme]` — may own skin-private material | New shared palette/space/radius/type/blur **scales** |
| How is one component wired? | **Recipe** in `@atom63/ui-react` | New system-wide value dictionaries |
| Day-to-day page JSX? | **Tailwind / shadcn roles** (`bg-background`, `text-muted-foreground`, …) | `--a63-control-*`, foundation primitives |

**Foundation owns shared dictionaries.** Theme-private material (gel, bevel, CRT, skin-only gloss/texture) may live in the theme file as scoped context. Semantics, contracts, and adapters still alias / remap / re-reference — they do not mint a second shared scale.

## Authoring lanes

```txt
App / page JSX
  → Tailwind + shadcn semantic roles  (design surface)

Shared control
  → ui-react recipe reads --a63-* (+ family contracts)

Shared color / scale dictionary
  → tokens/foundation/*

Role meaning (light/dark, brand primary)
  → tokens/semantics.css + tokens/brand.css

Skin character (including theme-private stacks)
  → themes/*.css assigns contract knobs; promote to foundation only when shared
```

| Stage | Write with | Why |
| --- | --- | --- |
| App / page / layout | `bg-background`, `text-foreground`, `border-border`, `bg-primary`, … | Familiar design dialect; adapters re-reference `--a63-*` (mirror rule) |
| Shared recipe | `--a63-surface-*`, `--a63-action-*`, `--a63-control-*`, … | Themes/axes can re-skin without forking anatomy |
| New **shared** literal (palette step, rem scale, blur step, generic shadow level) | `tokens/foundation/*` only | Single place for system-wide values |
| Theme trait | Assign contracts under `[data-a63-theme]`; skin-private `px` / `color-mix` stacks OK | Skin is scoped context — not a second global dictionary |
| Contract hook | Alias semantic + foundation; add only when growth rule passes | Shared physics, not a sketch vocabulary |

## Value ownership

### Shared scales → foundation

Do **not** add new hex / oklch / rem / px **scales** (palette ramps, spacing, radius, type, blur ladder, generic elevation ladder) outside `packages/styles/src/tokens/foundation/*`.

### Theme-private material → themes

Under `[data-a63-theme='…']` it is **OK** to author skin-only recipes inline (or as theme-scoped private helpers), including:

- Gel / bevel / CRT shadow stacks
- Gloss, highlight, pinstripe, scanline textures
- Skin-only blur stops that are not part of the shared blur ladder
- Weather paints that only exist for that skin

Still assign **contracts** (`--a63-control-shadow`, …). Do not invent new component-facing token trees in the theme file.

**Promote into foundation** when any of these is true:

1. A **second theme** (or a contract default) needs the same stop
2. It is a **shared scale step** adapters or product UI should reuse
3. An **adapter** must re-reference it (Tailwind `shadow-md`, `blur-lg`, …)

### Always allowed outside foundation

- `var(--…)` references
- `color-mix` / `calc` / `clamp` over existing tokens
- Universal mix endpoints: `transparent`, `white`, `black` (composition only — not new ramps)
- `env(...)` and intentional `0 0 #0000` “flat shadow” placeholders used in comma-separated `box-shadow` lists

### Not allowed (new work)

- New **shared** palette / spacing / radius / type / blur dictionaries in contracts, recipes, or adapters
- One-off `rgb(...)` / `oklch(...)` paints in **contracts or recipes** that should have been a foundation or semantic token
- Theme files inventing a **system-wide** color/size scale (that belongs in foundation)

Contract / recipe literal debt: [`foundation-value-drift.md`](./foundation-value-drift.md). Mass migration of shared-scale drift is **deferred**.

### Brand-dependent recipes

A `var()` inside a custom property resolves on the element where it is **declared**, then inherits as a resolved value. Brand-derived roles (`--a63-action-primary`, …) are declared on `:root, [data-a63-brand]` for that reason.

Prefer declaring phosphor / brand-tinted **theme** material on the theme scope (`[data-a63-theme='terminal']`) so `var(--a63-action-primary)` re-resolves with brand. If a brand-dependent recipe must live in foundation, re-declare it on `:root, [data-a63-brand]` — same rule as `brand.css`.

## CSS contract growth rule

Add or extend a file under `packages/styles/src/contracts/` only when **both** are true:

1. A **second** component (or a clear family) needs the same hook, and
2. A **theme** (or design-language axis) must override that hook without forking recipes.

Otherwise keep the value in the component recipe, or promote a shared literal into foundation / keep skin-private material in the theme.

Do not mint a contract because a token “might be reusable.” Prefer extending `control`, `field`, `overlay`, `surface`, `action`, etc.

## What agents / humans should open

| Task | Open first |
| --- | --- |
| Style a page | shadcn/Tailwind semantics; this doc’s lane table |
| Change blue-500 / spacing-4 / radius / blur scale | `tokens/foundation/*` |
| Change what “primary” means | `tokens/brand.css` / `semantics.css` |
| Make Aqua glossier / Retro chunkier / Terminal glow | `themes/<id>.css` (skin-private OK) |
| Reuse the same stop across two themes | Promote into foundation, then remap |
| Add a shared Button+Input size knob | Contract growth rule → maybe `control.css` |
| Audit shared-scale drift in contracts | [`foundation-value-drift.md`](./foundation-value-drift.md) |

## Related

- [`theme-authoring.md`](./theme-authoring.md) — theme file guardrails
- [`personalization-axes.md`](./personalization-axes.md) — which axis owns which tokens
- [`ui-react-component-review.md`](./ui-react-component-review.md) — recipe/contract review checklist
- `apps/design-system` → Foundation → Designing in code — live semantic cheat sheet
