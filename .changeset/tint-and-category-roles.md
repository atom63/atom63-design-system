---
'@atom63/styles': minor
'@atom63/ui-react': patch
---

Tints and category colors are semantic roles.

- `@atom63/styles` adds `-subtle` and `-subtle-foreground` pairs for destructive, info, success and warning (`--a63-action-danger-subtle`, `--a63-status-*-subtle`), and `--a63-category-<hue>`, `-subtle` and `-subtle-foreground` for all 22 palette hues, including slate, gray, zinc and stone, which had no token before. Every tint is a 14% wash mixed in oklab. The roles table exposes them as `destructive-subtle`, `info-subtle`, `success-subtle`, `warning-subtle` and `category-<hue>(-subtle)(-foreground)`.
- The amber category uses the warning ramp, so amber chips and warning chips are one hue.
- The `--a63-badge-*` contract tokens stay as aliases of the new roles.
- `@atom63/ui-react`: Badge reads the semantic tints. Palette chips move from a 15% to a 14% tint, error chips from 12% to 14%, and amber chip text from amber-800 to warning-800 (amber-400 to warning-400 in dark mode).
