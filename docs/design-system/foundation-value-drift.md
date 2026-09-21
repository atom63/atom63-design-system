# Foundation / contract value drift inventory

> **Status.** Snapshot for harden work. **Mass migration is deferred.**
> Policy for new code: [`authoring-surfaces.md`](./authoring-surfaces.md)
> (foundation = shared scales; themes may own skin-private material).
>
> Generated from a scan of `packages/styles` contracts and token bridges
> (themes are **not** drift for skin-private stacks). Re-run / extend when
> cleaning a family.

## Intent vs reality

**Intent:**

- **Shared** dictionaries (palette, space, radius, type, blur ladder, generic
  shadow ladder) live in `packages/styles/src/tokens/foundation/*`.
- **Theme-private** material (gel, bevel, CRT, gloss, scanlines, weather paints)
  may live under `[data-a63-theme]` in `themes/*.css`.
- Semantics, contracts, and adapters alias / remap / re-reference — they do not
  mint a second shared scale.

**Reality:** contracts (and some bridges) still author geometry and paints that
belong in foundation shared scales or semantic roles. That is the main “where
do I edit this?” confusion for *system-wide* values. Theme skin stacks in
`themes/*.css` are expected context, not a backlog to empty into foundation.

## Allowed compositional endpoints (not drift)

| Pattern | Why allowed |
| --- | --- |
| Theme-private stacks under `[data-a63-theme]` | Skin-scoped context ([authoring-surfaces.md](./authoring-surfaces.md)) |
| `transparent`, `white`, `black` inside `color-mix` / gradients | Universal mix endpoints |
| `0 0 #0000` as a flat `box-shadow` placeholder | Comma-list composition (`none` breaks lists) |
| `var(--…)` / `calc` / `color-mix` of existing tokens | Alias / composition |
| `env(safe-area-inset-*)` | Platform environment |

## Drift by area

Severity: **P1** = invents paint/size someone will want to tune **globally**;
**P2** = geometry literals that should become foundation scale steps;
**P3** = noisy but low risk (comments, placeholders, one-off env floors).

### Themes (`packages/styles/src/themes/*`) — not drift for skin material

Skin character belongs here. Do **not** treat gel/bevel/CRT/gloss/texture as
foundation debt. Promote a theme literal into foundation only when a second
theme, a contract default, or an adapter needs the same stop.

| File | Notes |
| --- | --- |
| `modern.css` | Quiet insets / segment plates — theme-private OK |
| `aqua.css` | Gel shadows, gloss, pinstripe, weather — theme-private OK; may still use shared `--blur-*` |
| `retro.css` | Bevel stacks, chunky borders, weather — theme-private OK |
| `terminal.css` | CRT glows, scanlines, mode-split palette — theme-private OK; brand-tinted mixes prefer theme scope |

### Contracts (`packages/styles/src/contracts/*`) — P2 (main backlog)

| File | Drift examples | Suggested harden |
| --- | --- | --- |
| `control.css` | Icon size rem ramp (`0.75rem`…`1.25rem`), `1px` border, `3px` focus ring, `translateY(1px)` press | Map icon sizes → type/spacing foundation; border/focus/press → foundation effects or space |
| `environment.css` | Min targets `1.5rem` / `2.75rem` / `3rem` / `3.25rem`, iOS icon overrides, `1rem` editable floor, `40rem` breakpoint | Foundation touch-target + breakpoint tokens; environment only remaps by axis |
| `selection.css` | `--a63-switch-thumb-size: 1rem` | Foundation size token |
| `menu.css` | `--a63-menu-item-inset: 2rem` | Foundation space step |
| `widget.css` | Rim `4px` / `0px`; **`rgb(255 255 255 / 0.7)`** weather muted/divider | **P1** for weather RGB — should be semantic/foundation alpha tokens |
| `overlay.css` / `surface.css` / `field.css` / `track.css` | Default shadow stacks with raw `px` + `black` mixes | Shared default material → foundation effects; contracts alias |
| `trigger.css` / `marker.css` | `0 0 #0000` placeholders | OK (allowed pattern) |

### Semantics / brand bridges — mostly OK, small P2/P3

| File | Notes |
| --- | --- |
| `tokens/semantics.css` | Uses foundation surfaces + `color-mix`; fixed `white` status/action foregrounds and scrim `black` mixes — acceptable composition; optional later: named `--color-on-accent` foundation aliases |
| `tokens/brand.css` | Contrast foreground via `oklch(...)` formula — compositional; ensure inputs are foundation brand stops |
| Scale bridges (`space`, `radius`, `type-scale`, `font`, `motion`) | Should only alias foundation — treat any new literal here as drift |

### Adapters — not drift

`tailwind/*` and `compat/*` must only re-reference (mirror rule). Do not put
literals there.

### Recipes (`@atom63/ui-react`) — out of scope for this snapshot

Recipes may still contain layout literals. Harden toward contract/foundation
references when editing a component; full recipe audit is a separate pass.

## Deferred mass migration

**Explicitly deferred:** rewriting all contract default literals into foundation
in one change. Reasons: high visual regression risk; themes already own skin
material by policy.

**When to harden a pocket:**

1. You are already editing that contract family or shared scale.
2. A value needs reuse across two themes or two contracts (then promote).
3. You cannot tell whether to edit foundation or a contract default — put the
   shared stop in foundation, alias from the contract.

**Success for new work:** PR review asks “is this a **shared** scale?” If yes →
foundation. If it is skin character → theme file. If it is a contract inventing
a new rem/px ladder → drift.

## Related

- [`authoring-surfaces.md`](./authoring-surfaces.md)
- [`theme-authoring.md`](./theme-authoring.md)
- [`packages/styles/README.md`](../../packages/styles/README.md)
