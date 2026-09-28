# Cipher Plugin — Version History

## Unreleased
Sync has two modes. Atom63 syncs the bundled Atom63 tokens, as before. Project reads a project's own token CSS (the site template's `src/styles/tokens`, or any CSS custom properties under `:root`, `.light`, `.dark` and `data-*` attributes) and writes it as Figma variables: each `data-*` attribute becomes a collection with its values as modes, `var()` becomes an alias, a color at an opacity becomes a composed color, and `calc()` is computed per mode. Variables carry their CSS name as web code syntax, and raw ramps are hidden from pickers. Project mode also lists the variables edited in Figma as changes for a coding agent to apply to the CSS.

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
