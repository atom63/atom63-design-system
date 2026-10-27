---
'@atom63/styles': minor
'@atom63/ui-react': minor
---

Text without a size class now takes the body role (15/23 on the web, 17/22 in a phone scope) instead of the browser's 16/24: `@atom63/styles` sets it on `body` and `[data-a63-form-factor]`, and the `@atom63/ui-react` reset sets it on `Atom63Theme` and `UIProvider` (which used the `sm` step, 13/20, before). `html` keeps the browser size, so `1rem` is still 16px.

Density now applies once, on `<html>` or on a nested scope such as `<UIProvider density="compact">`. Every `:root` token built on `--a63-space-unit` (the space steps, control heights and paddings, row padding, control, menu, toggle and trigger gaps) is declared again on `[data-a63-density]`, so a nested scope recomputes it, and the design-language and phone scopes keep their height ramp inside a density scope. `--a63-density-scale` stays 1 in every density, so compact controls scale by 0.875 (32px to 28px) instead of 0.79 on the root and 0.9 with unchanged spacing on a nested scope.
