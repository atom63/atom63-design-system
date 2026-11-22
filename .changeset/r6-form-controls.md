---
'@atom63/ui-react': minor
'@atom63/ui-foundation': minor
'@atom63/cli': patch
---

Form controls:

- `Field` takes `invalid` and `disabled` props, and a rendered `FieldError` now sets `data-invalid` on the field, so the label tints without `data-invalid="true"`. Input and Textarea draw their danger edge when their field is `aria-invalid`.
- `FormControl` no longer overwrites the wrapped control's `data-slot` (it adds `data-form-control`) and sets `aria-invalid` only on error; `form-control` leaves the Form contract's slots. `FormMessage` is `role="alert"` only while it shows an error, without `aria-live`.
- `Textarea` takes `maxRows` (default 12); past it, the field scrolls instead of growing.
- On a coarse pointer, Input and the Select trigger take a 44px tap through a hit strip, and Select options grow to the 44px row height.
- Select options wrap instead of truncating, and the popup grows up to 20rem.
- `SelectTrigger` opens the list on Home and End, at the first or last option; in `SelectPopup`, Tab and Alt + Up Arrow select the focused option. The four gaps leave the Select contract's `knownGaps`.
- The CLI answers for Field, Form, Select and Textarea are written guides.
