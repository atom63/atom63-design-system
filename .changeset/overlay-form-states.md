---
'@atom63/ui-react': patch
'@atom63/ui-foundation': patch
---

`SelectTrigger` and `AutocompleteInput` take an `invalid` prop and draw the same danger edge as `Input` when it or `aria-invalid` is set; the Autocomplete input gains a hover border. The Select contract lists an `invalid` state and the Autocomplete contract lists `hover` and `invalid`. The default `Toaster` now reads `--a63-surface-overlay`, `--a63-border-subtle`, `--a63-text-primary` and `--radius-lg` instead of the shadcn compat variables, so its toast has a fill with only `@atom63/ui-react/styles.css` installed.
