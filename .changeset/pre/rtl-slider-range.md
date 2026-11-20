---
'@atom63/ui-react': minor
---

Right-to-left fixes and a controlled range Slider:

- `UIProvider` takes `dir` (`'ltr' | 'rtl' | 'auto'`). It sets the `dir` attribute and, for `ltr`
  and `rtl`, provides Base UI's direction to the parts inside, so a Slider under `dir="rtl"` drags
  and steps right to left. Before, Base UI parts always behaved left to right.
- `Slider` adds `onValuesChange(values, eventDetails)`, which reports every thumb, so a ranged
  slider can be controlled. `onValueChange` still reports a plain number (the first thumb).
- `Switch`: under `dir="rtl"` the checked thumb slides left and stays inside the track.
- `Drawer` and `Sheet`: `left` and `right` are physical screen edges in right-to-left pages too.
  A left drawer or sheet now docks to the left edge, matching its slide, safe-area padding, swipe
  direction and inner border; before, it docked to the right.
- `Marquee`: under `dir="rtl"` the strip scrolls right, so the loop no longer opens a gap.
