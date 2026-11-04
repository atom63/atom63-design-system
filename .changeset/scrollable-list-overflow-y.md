---
'@atom63/ui-react': patch
---

ScrollableList no longer scrolls vertically. Base UI sets `overflow: scroll` inline on the ScrollArea viewport, which the `overflow-y-hidden` class could not override; the list now sets `overflow-y: hidden` inline, so a row of chips (such as suggested prompts) moves only sideways.
