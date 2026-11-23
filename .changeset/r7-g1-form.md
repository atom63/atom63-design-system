---
'@atom63/ui-react': minor
'@atom63/ui-foundation': minor
'@atom63/styles': patch
---

Form controls, round 7:

- `Textarea` takes `variant` (`default`, `filled`, `plain`), the same field chrome as `Input`; the textarea contract lists the variants.
- `SegmentedControl` scrolls the selected segment fully into view in a scrolling track, on mount and when the selection changes, and a pressed segment's content dips.
- `FieldLabel`, `FieldLegend`, `FieldDescription`, `FieldError`, `FormDescription` and `FormMessage` wrap long words and unbroken URLs instead of widening the form.
- Terminal light `--a63-text-tertiary` is lighter (90% of the action colour instead of 80%), so a placeholder reads clearly below the value while keeping 4.5:1.
