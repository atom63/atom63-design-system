# Personalization axes

The design system can be personalized along a fixed set of **axes**. Each axis is
attribute-scoped (`data-a63-*`) or a scalar custom property, applied at any scope
and inherited, and owns a specific slice of tokens. Keeping the axes orthogonal —
each owning a distinct concern — is what lets them compose without fighting.

**Single source of truth:** `packages/ui-foundation/src/axes.ts`
(`personalizationAxes`). The runtime value tuples, types, and `defaultUIEnvironment`
in `environment.ts` derive from it. `UIProvider` stamps a subset; the appearance
`PersonalizationController` / `applyPersonalization` stamps the full live set.
This page is a human-readable mirror; the registry is authoritative.

Attribute stamp map (canonical vs OS63/Storybook bridges):
[attribute-runtime.md](./attribute-runtime.md).

## Axes

| Axis | Attribute | Values (default **bold**) | Category | Runtime |
| --- | --- | --- | --- | --- |
| Design language | `data-a63-design-language` | **web**, ios | platform | ✅ |
| Mode | `data-a63-mode` | **light**, dark, system | appearance | ✅ |
| Theme | `data-a63-theme` | **modern**, aqua, retro, terminal | appearance | ✅ |
| Brand | `data-a63-brand` | auto, **b1**, b2, b3, b4, b5, b6 | appearance | ✅ |
| Input | `data-a63-input` | touch, **pointer**, keyboard | ergonomics | ✅ |
| Density | `data-a63-density` | compact, **comfortable** | ergonomics | ✅ |
| Surface | `data-a63-surface` | **n1**, n2, n3, n4, n5, n6 | appearance | ✅ |
| Surface tint | `--a63-surface-tint` (scalar) | **0%** … 100% | appearance | ✅ |
| Type scale | `data-a63-type-scale` | compact, **normal**, comfortable, large | appearance | ✅ |
| Radius | `data-a63-radius` | none, subtle, **default**, round | appearance | ✅ |
| Font | `data-a63-font` | **sans**, serif, mono, pixel | appearance | ✅ |
| OS | `data-a63-os` | **macos**, windows | system | ✅ |
| Icon theme | `data-a63-icon-theme` | **realistic**, color, neutral, primary | system | ✅ |

*Runtime* = currently stamped by `UIProvider` and/or `PersonalizationController`
(`applyPersonalization`). Catalog-only axes would be declared for planning but not
yet wired — none today.

**Surface tint** is a *scalar* (0–100%), not a discrete attribute: it bends the
neutrals toward the brand hue. Rather than mixing all 24 raw ramp stops (as a
Tailwind app would — 144 mixes), we mix only the **~6 semantic surface/border
tokens** the system actually consumes, in `tokens/semantics.css`, each toward a
**lightness-matched `--a63-brand-*` step** (per production's
`SURFACE_TO_PRIMARY_STEP`: light-1→brand-50, light-2→100, …, dark stops mirror).
That's ~12 `color-mix`es instead of 144, and it resolves correctly because those
tokens sit at the mode scope, co-located with surface + brand + tint on the
personalization root. It reuses the `--a63-brand-*` ramp (this is what earns most
of the ramp's "unused" stops). Themes that fully re-skin surfaces (aqua/terminal)
own their surface identity and don't receive the brand tint.

## What each axis owns — the token build/harden checklist

Status: ✅ built · 🟡 partial · 🔲 planned

**Design language** — *component sizing & interaction feedback only; never color or shape.*
- ✅ control sizing — `--a63-control-height-*`, `--a63-control-padding-inline-*`, `--a63-control-font-size-*`, `--a63-control-font-weight`
- ✅ interaction feedback — `--a63-control-press-transform`, `--a63-control-feedback-ease`
- 🔲 android / desktop recipes (only web + ios today — deferred until a second design language ships)

**Mode** — *luminance.*
- ✅ semantic colors — `--a63-surface-*`, `--a63-text-*`, `--a63-border-*`, action `*-hover` (keys both `.light`/`.dark` class **and** `[data-a63-mode]`)

**Theme** — *visual skin / material: assigns contract knobs under `[data-a63-theme]`, never structure. Theme-private stacks (gel/bevel/CRT) OK; shared scales stay in foundation — see [authoring-surfaces.md](./authoring-surfaces.md).*
- ✅ control / field / overlay material — gloss, shadow, bevel, texture under `[data-a63-theme]`
- ✅ foundation blur scale — `--blur-*` in `tokens/foundation/effects.css` (Tailwind re-references)
- ✅ theme files — `themes/*.css`: `modern`, `aqua`, `terminal`, `retro`
- 🟡 richer per-theme semantic re-skins — aqua/terminal surface rewrites exist; deeper polish is product backlog (architecture OK). Press shadows covered on all four skins. Contract shared-scale drift: [foundation-value-drift.md](./foundation-value-drift.md).

**Brand** — *primary/accent color ramp; only primary switches, status colors stay semantic.*
- ✅ brand ramp — `--a63-brand-50 … --a63-brand-950` (`auto` falls back to b1 until wallpaper-derived `--color-auto-*` fills in)
- ✅ primary action + focus — `--a63-action-primary`, `-hover`, `-foreground`, `--a63-focus-ring` (in `tokens/brand.css`, scoped to `[data-a63-brand]`)

**Input** — *pointer ergonomics.*
- ✅ touch target — `--a63-control-min-target`
- 🔲 hit slop / focus affordance (deferred until a touch product needs more than `--a63-control-min-target`)

**Density** — *layout rhythm.*
- ✅ spacing rhythm — `--a63-space-unit`, `--a63-density-scale`

**Surface** — *neutral surface palette (which greys).*
- ✅ surface palette — `tokens/surface.css` remaps `--surface-light-*` / `--surface-dark-*` per `[data-a63-surface="n1..n6"]`

**Surface tint** — *how much brand hue bends those greys.*
- ✅ semantic surface/border tint — `--a63-surface-tint` mixes ~6 semantic tokens toward lightness-matched `--a63-brand-*` steps

**Type scale** — *global typographic scale.*
- ✅ `--typography-scale` via `tokens/type-scale.css`

**Radius** — *corner multiplier across the shared ramp.*
- ✅ `--radius-multiplier` via `tokens/radius.css`

**Font** — *UI type personality.*
- ✅ font family mapping via `tokens/font.css`

**OS** — *chrome frame structure (window controls, launcher geometry); peer of Theme.*
- ✅ window + launcher structure — `os/macos.css` + `os/windows.css` under `[data-a63-os]`
- ✅ caption / launcher chrome paint — `--a63-os-caption-*` / launcher fills composed from semantics (platform-conventional; not a product theme)

**Icon theme** — *OS app-icon presentation (React-consumed).*
- ✅ stamped as `data-a63-icon-theme`; gradients use foundation `--color-*`; primary theme uses `--a63-action-*`

## Principles

- **Orthogonal ownership.** No two axes own the same token group. Design language
  owns sizing/feedback; theme owns material skin; radius / type scale / font are
  their own axes; brand owns the primary ramp; mode owns luminance; OS owns chrome
  structure.
- **Inherit, don't reset.** `UIProvider` only stamps the attributes for
  dimensions explicitly passed; the rest inherit from an ancestor/root scope.
  Personalization (brand, theme, surface, …) is typically set once high up via
  the appearance controller.
- **Declare derived tokens on the scope that changes them.** A `var()` inside a
  custom property resolves on the element where it's *declared*, then inherits as
  a resolved value. So brand-derived tokens (`--a63-action-primary`, etc.) are
  declared on `:root, [data-a63-brand]` — not only `:root` — or they'd freeze to
  the base ramp. Apply the same rule when building the surface-tint axis.

## Naming note

Older persisted personalization used product id `y2k`. Stores migrate that to
canonical `retro` (atom63 persist v2, os63 persist v4). Display label is
**Retro**; CSS aesthetic comments may still describe the bevel as Win98 / early-web.

## Slides are a separate contract

`@atom63/slides` theming uses `--theme-slide-*` (and a small base palette) inside
the slides package — it is **not** driven by `data-a63-theme` / appearance axes.
Do not fold slide tokens into personalization without an explicit bridge.
