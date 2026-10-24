---
'@atom63/ui-react': patch
---

`ScrollableList` works in right-to-left layouts: it reads the scroll offset from the start edge, so the chevrons show on the correct side, point the right way and scroll in the right direction. The control wrappers' `data-side` is now `start` or `end` instead of `left` or `right`, and they are positioned with logical insets.
