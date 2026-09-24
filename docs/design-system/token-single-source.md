# Phase B: DTCG as the single token source

Status: design, 2026-09-24. Implements decision D1 in [roadmap.md](./roadmap.md) (every layer moves
to DTCG, in two steps: semantics and brand first, then contracts and themes).

## Why

About 56% of the token manifest (841 of 1491 entries) is generated from DTCG today. The rest is
hand-written CSS:
- `tokens/brand.css`
- `tokens/semantics.css`
- `contracts/*.css`
- `foundation/{typography,radius,effects}.css`
- the axis files

Themes and OS chrome are not in the manifest at all. So Figma and iOS see only part of the system.
The Figma write-back path can only change DTCG literals, and every semantic value is a black box to
designers.

## Rules for every slice

1. **Pure refactor first.** Each slice moves one CSS file into DTCG sources, and the generated CSS
   replaces the hand-written file. The token manifest (`generated/atom63.tokens.json`) and the Figma
   sync model must not change, except for provenance fields. Visual baselines must not change. A slice
   that changes a value is a separate PR.
2. **One axis per token.** A Figma collection has one mode dimension, so each token varies along one
   axis at most. A token that depends on two axes (for example brand × mode) is split into two tokens
   joined by an alias. This is what makes Figma 1:1 possible.
3. **Formulas are declared, not hidden.** DTCG has no `color-mix()` or relative-color syntax. A
   derived value is written as a DTCG token whose `$value` is its main input (an alias). The formula
   goes in `$extensions["io.atom63.derive"]` as the CSS expression, with inputs referenced by token
   path. The CSS generator emits the expression. The Figma generator keeps resolving in Chromium, marks
   the variable as derived (read-only in the plugin), and records its inputs, so a designer knows to
   edit the input instead.
4. **Runtime values stay runtime.** The `auto` brand ramp is written by JavaScript at runtime, and the
   CSS keeps its fallback (`var(--color-auto-50, var(--color-b1-50))`). This is written as a
   `io.atom63.derive` expression over the fallback alias, and Figma sees the fallback.

## Generator changes

`scripts/build-css-from-dtcg.mjs` today handles `*.tokens.json` (one `:root` block) and a
`*.resolver.json` with one modifier and inline contexts (`surface.resolver.json`). It needs:

- **Several resolver files, each with its own axis.** Examples: `brand.resolver.json` (b1–b6, auto) and
  `mode.resolver.json` (light, dark).
- **Per-context selectors.** Selectors are declared in `$extensions["io.atom63.css"]` on the context,
  for example `":root, .light, [data-a63-mode='light']"` and `":is(.dark, [data-a63-mode='dark'])"`.
  The default is `[data-a63-<axis>='<context>']`, plus `:root` for the default context.
- **A base group outside any context.** These are tokens declared on the axis scope for every context,
  such as the action block on `:root, [data-a63-brand]` that must re-resolve where the ramp is remapped.
- **Emitting `io.atom63.derive` expressions.**

The manifest generator keeps reading CSS, so the manifest check is the equivalence proof for each
slice.

## Slices

| # | Slice | Source → DTCG | Proof |
|---|---|---|---|
| B1 | Brand ramp | `brand.css` ramp blocks (b1–b6, auto) → `brand.resolver.json` | manifest + Figma model unchanged |
| B2 | Brand action block | primary action, hover, `brand-text`, foreground formula, focus ring, per-brand overrides (b3, b2) → same resolver, base group + context overrides | same |
| B3 | Mode semantics | `semantics.css` light/dark blocks → `mode.resolver.json`; tint `color-mix()` formulas as derive expressions | same, plus visual baselines |
| B4 | Figma write-back | `token-patch.mjs` applies multi-mode collections by writing into resolver contexts; aliases and derived tokens are rejected with a reason that names the input to edit | round-trip test with the fake Figma API |
| B5 | Remove duplicates | delete the 24 `--surface-*` entries that `aliases.css` repeats from the surface resolver | manifest loses exactly those 24 entries; the Figma model is unchanged (it already listed them once, in Surface) |
| B6 | Contracts | `contracts/*.css` → `contracts/*.tokens.json` (mostly aliases plus derive expressions) | manifest unchanged |
| B7 | Themes | `themes/*.css` → `theme.resolver.json` (modern, aqua, retro, terminal); the manifest and Figma gain a Theme collection | new Figma collection; iOS `AtomTheme` values per theme |

B1–B5 are step one of D1, and B6–B7 are step two. iOS follows automatically: Swift colors are resolved
from the Figma sync model (phase A), so once themes are in the model, `AtomTheme` can be generated per
theme.

## Open questions, decided per slice

- **How `io.atom63.derive` is shaped.** It could be one CSS expression string with `{token.path}`
  placeholders, or a small structured form (`{ "fn": "color-mix", "space": "oklch", "args": [...] }`).
  Start with the string form, because every consumer today is CSS or Chromium. Revisit it when iOS
  needs to evaluate a formula natively.
- **Mode tokens that are the same in both modes.** For example, `--a63-scrim` is declared once at
  `:root`. They stay in a plain `*.tokens.json` rather than a mode context.
