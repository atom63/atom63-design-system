---
'@atom63/styles': patch
'@atom63/ui-foundation': patch
'@atom63/ui-react': patch
---

Sheet's default side is now `inline-end`: unchanged in left-to-right pages, and a sheet opens from the left in right-to-left pages. Pass `side="right"` to keep the physical right edge.

SegmentedControl's track grows to the minimum touch target on a coarse pointer, because the scrolling track clips hit areas drawn outside it. In the terminal theme's dark mode the selected segment takes a phosphor-tinted plate and a brighter label than the resting segments.

Toaster colours each toned toast's icon with its status colour and starts it with a visually hidden status word ("Error:", "Success:"), which the new `statusLabels` prop translates. Textarea has a RightToLeft story.
