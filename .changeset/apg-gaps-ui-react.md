---
'@atom63/ui-react': patch
---

Close APG pattern gaps in Dialog and Accordion:

- `Dialog` is now a wrapper around Base UI's `Dialog.Root` (same props) that passes `modal` to
  `DialogPopup`, which sets `aria-modal="true"` unless `modal={false}`.
- `Accordion` keeps collapsed panels mounted and hidden by default (`keepMounted` now defaults to
  `true`), and every `AccordionTrigger` has `aria-controls` referring to its panel, expanded or
  not. With `keepMounted={false}` on the root or an `AccordionContent`, a collapsed header has no
  `aria-controls`, as before.
