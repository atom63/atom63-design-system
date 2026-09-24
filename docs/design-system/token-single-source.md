# Phase B: DTCG as the single token source

Status: shipped. B1–B7 on 2026-09-24 (#25–#32), B8a (#45) and B8b on 2026-09-25. Implements decision D1 in
[roadmap.md](./roadmap.md) (every layer moves to DTCG, in two steps: semantics and brand first, then
contracts and themes). Of the 1669 token manifest entries, 1603 are generated from DTCG sources. The other 66 are values
with no DTCG type in `*.native.css` files, each listed with a reason in `native-values.json`. No
other token is written by hand. (Earlier progress figures of 87% and 91% counted the native values
as DTCG.)

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
- **Emitting `io.atom63.derive` expressions.** `{$value}` in an expression is the token's own
  `$value`, so a formula over a literal does not repeat it: every type-scale step is
  `calc({$value} * var(--typography-scale, 1))`.
- **Explicit emit targets (B8b).** A modifier with `$extensions["io.atom63.css"].emit` writes its
  contexts to an ordered list of targets instead of attribute selectors. Each target names a
  context, a selector and an optional at-rule, and declares either the context's `resolved` values
  (the sets before the modifier, overridden by the context) or only the `changes` from the context
  listed before it. The type scale writes each Viewport step twice from one set of values: as a
  cumulative `@media (min-width: …)` block on `:root` and as a complete `[data-window-size]` rule.

The manifest generator keeps reading CSS, so the manifest check is the equivalence proof for each
slice.

## Slices

| # | Slice | Source → DTCG | Proof | Status |
|---|---|---|---|---|
| B1 | Brand ramp | `brand.css` ramp blocks (b1–b6, auto) → `tokens/brand-ramp.resolver.json` | manifest + Figma model unchanged | shipped (#25) |
| B2 | Brand action block | primary action, hover, `brand-text`, foreground formula, focus ring, per-brand overrides (b3, b2) → `tokens/brand-action.resolver.json`, base group + context overrides | same | shipped (#26) |
| B3 | Mode semantics | `semantics.css` light/dark blocks → `tokens/semantics.resolver.json`; tint `color-mix()` formulas as derive expressions | same, plus visual baselines | shipped (#27) |
| B4 | Figma write-back | `token-patch.mjs` applies multi-mode collections by writing into resolver contexts; aliases and derived tokens are rejected with a reason that names the input to edit | round-trip test with the fake Figma API | shipped (#28) |
| B5 | Remove duplicates | delete the 24 `--surface-*` entries that `aliases.css` repeats from the surface resolver | manifest loses exactly those 24 entries; the Figma model is unchanged (it already listed them once, in Surface) | shipped (#29) |
| B6 | Contracts | `contracts/*.css` → `contracts/*.tokens.json` or `*.resolver.json` (mostly aliases plus derive expressions) | manifest unchanged | shipped (#30) |
| B7 | Themes | `themes/*.css` → `themes/<id>.resolver.json` (modern, aqua, retro, terminal); the manifest and Figma gain a Theme collection | new Figma collection | shipped (#31, #32) |
| B8a | Scales and axes | `foundation/{radius,effects}.css` and the axis files `tokens/{space,radius,motion,font,type-scale}.css` (71 entries); radius, font and type-scale become one modifier each | manifest and Figma model byte-identical | shipped |
| B8b | Type scale | `foundation/typography.css` (144 entries) → `foundation/typography.resolver.json`: one Viewport modifier (xs, sm, md) emitted both as `@media` breakpoints and as `[data-window-size]` rules; the two already agreed at every breakpoint | declarations identical in order; manifest gains only the native file in `generatedFrom`; Figma model byte-identical | shipped |

B1–B5 are step one of D1, and B6–B8 are step two. iOS follows automatically: Swift colors are resolved
from the Figma sync model (phase A). Themes are in the model since B7, so `AtomTheme` values can now be
generated per theme; that is a separate slice (decision D2).

## CSS-native values (decided 2026-09-24, during B6)

About 60 contract values have no DTCG type:
- `none` and transforms such as `scale(0.97)`
- `env(safe-area-inset-bottom, 0px)` and `100dvh`
- composite shadows with `color-mix()`
- `solid`

They are implementation details, not design decisions a designer would edit, and Figma skips them
already. Forcing them into DTCG would mean writing a misleading stand-in `$value`. So they stay in
hand-written CSS. The rule that keeps them from becoming black boxes:

- A contract file is migrated whole when every value it declares has a DTCG type.
- A file with CSS-native values is split. The DTCG-typed tokens move to `<name>.tokens.json`, and
  generate `<name>.css`. The CSS-native ones move to `<name>.native.css`, which the generated
  `<name>.css` imports (`$extensions["io.atom63.css"].imports`), so the contract keeps one entry
  point.
- A native file may also hold element styles that belong with its token file but are not tokens,
  such as `small` in `typography.native.css`.
- Every custom property in a `*.native.css` file is listed in `native-values.json` with a one-line
  reason. A check fails when a native file declares a value that is not listed, so a new
  hand-written value needs a reviewed entry.

## Themes in Figma and iOS (B7b, decided 2026-09-24)

Themes are generated from DTCG since B7a, but they are not yet in the token manifest, so neither
Figma nor iOS sees them. Measured on the current sources:
- 85 tokens are overridden by at least one theme.
- 32 of them sit in the Contract collection and 8 in the Mode collection.
- 27 are theme-only hooks that are in no collection yet.
- 18 are skipped types, such as image layers.
- None of them varies on the brand, surface, density, radius, input or design-language axis, so
  no token needs two axes.

- **One Theme collection with eight modes**, one per theme × mode: `modern-light`, `modern-dark`, …,
  `terminal-dark`. Every token that any theme overrides moves there, and each mode holds the value
  Chromium resolves for that theme and mode. Aqua and terminal vary tokens by theme and mode
  together, so a single mode dimension of theme × mode is the only 1:1 model. It fits Figma's
  limits: variable modes need a Professional plan (up to 10 modes per collection) or
  Organization (20).
- **Moving variables keeps bindings.** The Figma API cannot move a variable to another collection.
  When a token's collection changes, the plugin:
  1. creates the variable in its new collection;
  2. rebinds every node and style bound to the old variable, and re-points aliases to it;
  3. retires the old one: renames it under `(moved)/`, clears its token data and hides it from
     publishing. It is never deleted, so a binding the plugin missed still resolves.

  Without step 2, designs would stay bound to a stale orphan. The plugin tests cover the move.
- **iOS** resolves Theme-collection tokens with the `modern-<mode>` mode by default. Per-theme
  Swift values (decision D2) are generated from the same collection in a later slice.

## Open questions, decided per slice

- **How `io.atom63.derive` is shaped.** It could be one CSS expression string with `{token.path}`
  placeholders, or a small structured form (`{ "fn": "color-mix", "space": "oklch", "args": [...] }`).
  Start with the string form, because every consumer today is CSS or Chromium. Revisit it when iOS
  needs to evaluate a formula natively.
- **Mode tokens that are the same in both modes.** For example, `--a63-scrim` is declared once at
  `:root`. They stay in a plain `*.tokens.json` rather than a mode context.
