---
'@atom63/ui-react': minor
'@atom63/cli': patch
---

`CommandDialogPopup` sets `aria-modal="true"`, as `DialogPopup` does; `CommandDialog modal={false}` leaves it off. `CommandInput` gets a default accessible name, "Search commands", which the new `label` prop replaces; passing `aria-label` or `aria-labelledby` skips it.
