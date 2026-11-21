---
'@atom63/styles': minor
'@atom63/ui-react': patch
---

A nested `[data-a63-brand]` or `[data-a63-surface]` scope without a mode (a `UIProvider` that passes only `brand` or `surface`) now re-declares the mode roles that read the brand or neutral ramp: the surfaces, text, borders, `--a63-text-accent`, `--a63-focus-ring`, `--a63-selected-accent-*`, `--a63-choice-card-checked-*`, the badge, skeleton, toggle and widget mode tokens, and the Aqua and Terminal mode overrides. They follow the nearest mode scope through the new `--a63-if-light` / `--a63-if-dark` switch. Add `--a63-border-danger` for invalid control borders (step 600 at 62% in light mode, step 500 in dark mode). Input, Textarea, Select, Autocomplete, InputOTP, Checkbox and Radio draw invalid borders with it and a focused invalid border and ring with `--a63-status-danger`; LoadMoreTrigger's Retry label uses `--a63-text-danger`, and its error icon, FeedbackState's error accent and AlertDialog's destructive accent use `--a63-status-danger`.
