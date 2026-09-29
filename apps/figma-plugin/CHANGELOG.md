# Cipher Plugin — Version History

## Version 14 — unreleased
Sync has two modes, and both write variables the way code uses them.

- **Project** reads a project's own token CSS (the Atom63 site template's `src/styles/tokens`, or any CSS custom properties under `:root`, `.light`, `.dark` and `data-*` attributes) and writes it as Figma variables: each `data-*` attribute becomes a collection with its values as modes, `var()` becomes an alias, and `calc()` is computed per mode. It also lists the variables edited in Figma as changes for a coding agent to apply to the CSS.
- **Atom63** syncs the Atom63 tokens bundled from `@atom63/styles` and shows which version they come from.
- A color at an opacity (`color-mix()` with `transparent`) becomes a composed color, which keeps its alias and follows it in every mode, using Figma's new opacity on color variables. In Atom63 the focus ring now follows the brand this way, and so do the borders that themes tint with the primary color.
- Every variable shows its CSS name as web code syntax in Dev Mode.
- Variables appear only in the pickers they fit: text colors in text fills, borders in strokes, radii in corner radius; raw palette steps are hidden but still aliasable.
- A second sync reports no changes for decimal sizes such as 64.8, which Figma stores at 32-bit precision; they no longer show as updates on every run.
- Project mode reads pasted CSS as it is pasted, so Preview is ready without leaving the field, and the field scrolls instead of growing with the CSS.
- Apply and Download patch appear only when there is something to apply or download, and Finding edited variables clears the last sync result.

## Version 13 — April 14, 2026
Lock individual accent or neutral colors so they are skipped when shuffling — click the lock icon on any color row to pin it.

## Version 12 — April 14, 2026
Add `typography-fluid.css` export — a drop-in replacement for `typography.css` using CSS `clamp()` for smooth viewport scaling, better suited for landing pages and full-width layouts.

## Version 11 — April 13, 2026
Rebind: Scan/apply variable rebinding is limited to paint and text styles; effect styles (e.g. shadow colors) are no longer included (undo still works for older effect bindings).

## Version 10 — April 13, 2026

## Version 9 — April 13, 2026

## Version 8 — April 11, 2026

## Version 7 — March 24, 2026

## Version 6 — March 19, 2026

## Version 5 — March 13, 2026

## Version 4 — March 12, 2026

## Version 3 — March 12, 2026

## Version 2 — March 12, 2026

## Version 1 — March 11, 2026
