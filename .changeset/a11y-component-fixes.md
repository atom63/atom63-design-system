---
'@atom63/ui-react': patch
---

Accessibility fixes found by the new automated axe checks:

- `AutocompleteInput`: the built-in trigger and clear buttons, which show only an icon, now have
  accessible names ("Show suggestions" and "Clear"). Pass `aria-label` in `triggerProps` or
  `clearProps` to override them.
- `CommandInput` now sets `aria-expanded`, which `role="combobox"` requires; the inline command list
  is always open.
- `CommandSeparator` is now presentational, since a listbox may only own options and groups.
