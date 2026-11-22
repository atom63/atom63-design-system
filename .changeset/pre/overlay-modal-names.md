---
'@atom63/ui-react': minor
'@atom63/cli': patch
---

`SheetPopup` and a modal `DrawerContent` set `aria-modal="true"`, as `DialogPopup` does; `Sheet modal={false}` and `Drawer modal={false}` leave it off. `CommandDialogPopup` gets a default accessible name from a visually hidden title, "Command palette", which the new `title` prop replaces; passing `aria-label` or `aria-labelledby` skips it. `CommandDialogPopupProps` is exported.
