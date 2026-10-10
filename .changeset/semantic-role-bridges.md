---
'@atom63/styles': minor
---

Semantic roles now come from one table, and the role set covers what shadcn leaves out.

- `src/tailwind/roles.json` maps every role to its `--a63-*` token. `generate:roles` writes the semantic block of `tailwind/theme.css` and all of `compat/shadcn.css` from it, and `check:roles` fails when they drift or a role points at an undeclared token.
- New roles: `destructive-foreground`, `info-foreground`, `success-foreground`, `warning-foreground`, `surface-sunken`, `selected` and `selected-foreground`, and `chart-1` to `chart-5`. New tokens behind them: `--a63-selected-background`, `--a63-selected-foreground`, `--a63-chart-1` to `--a63-chart-5` and `--a63-surface-sidebar`.
- `--a63-status-{info,success,warning}-foreground` use the same auto-contrast step as the primary foreground instead of white. Text on solid warning and success fills now passes AA (it was 2.15:1 to 3.95:1).
- `sidebar` resolves to `--a63-surface-sidebar` in both bridges: the muted surface in light mode and the page surface in dark mode. Before, the Tailwind `bg-sidebar` utility stayed on the muted surface in dark mode while `var(--sidebar)` switched to the page surface.
