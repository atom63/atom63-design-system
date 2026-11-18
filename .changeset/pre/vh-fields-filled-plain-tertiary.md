---
'@atom63/styles': minor
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Add `--a63-text-tertiary`, a third text grey for placeholders, meta and timestamps that keeps WCAG AA 4.5:1 on the page, panel, field fill and muted fill in every theme and mode; every field placeholder now uses it. Add `variant="filled"` (a muted fill, no resting border) and `variant="plain"` (no border or fill, a separator below) to `Input`, `InputGroup` and `SearchField`, with `inputVariants` and `InputVariant` in the input contract.
