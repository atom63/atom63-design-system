---
'@atom63/styles': patch
---

`--a63-text-secondary` and `--a63-text-tertiary` now follow `--a63-surface-tint`: they mix toward brand 800 in light mode and brand 100 in dark mode by three tenths of the tint (the terminal theme's dark tertiary text lightens toward brand 100 the same way). At tint 0 they are unchanged. At 50% and 100% tint they keep WCAG AA 4.5:1 on the page, the panel and the muted surface for every brand, theme and mode; before, the tertiary text fell to 3.64:1 and the secondary text to 4.17:1 on the muted surface.
