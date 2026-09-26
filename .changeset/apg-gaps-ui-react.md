---
'@atom63/ui-react': patch
---

Close APG pattern gaps in Dialog, Accordion and Select:

- `Dialog` is now a wrapper around Base UI's `Dialog.Root` (same props) that passes `modal` to
  `DialogPopup`, which sets `aria-modal="true"` unless `modal={false}`.
- `Accordion` keeps collapsed panels mounted and hidden by default (`keepMounted` now defaults to
  `true`), and every `AccordionTrigger` has `aria-controls` referring to its panel, expanded or
  not. With `keepMounted={false}` on the root or an `AccordionContent`, a collapsed header has no
  `aria-controls`, as before.
- `Select` is now a wrapper around Base UI's `Select.Root` (same props). Home and End on the closed
  `SelectTrigger` open the list on the first or last option; Alt + Up Arrow in the open list
  selects the highlighted option and closes it; Tab selects the highlighted option before focus
  moves on. Tab and Alt + Up Arrow leave a multiple select unchanged.
