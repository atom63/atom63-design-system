---
'@atom63/ui-react': patch
'@atom63/cli': patch
---

`SectionHeader` wraps an unbroken title or description (a URL, a long compound) instead of overflowing a phone. `Container`'s grid rails set logical inline border widths. `Page` documents that inline padding belongs on a `Container`, not on Page's `className`, which would replace the safe-area inset. The data table section marks the selected row `aria-current` and wraps long values in the phone rows; the filter bar's select grows with a long option up to 20rem; the list page shows the invoice amount from 768px and in the phone row; the sign-in page keeps Page's inline safe-area inset.
