---
'@atom63/styles': patch
'@atom63/ui-react': patch
---

Meet WCAG AA contrast for the primary action and badges. `--a63-action-primary` now uses brand step 600 (700 for b3), so white labels reach 4.5:1. The new `--a63-text-accent` token carries the brand as text: the per-brand `--a63-brand-text` in light mode and step 400 in dark mode. Components that used the primary fill as text now use it. Badge foregrounds move to steps 700/800, and info, success and warning get their own badge foreground tokens. The auto-contrast switch for custom brand colors moves from the 3:1 point to where near-white and near-black give equal contrast.
