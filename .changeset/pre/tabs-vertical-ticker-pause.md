---
'@atom63/ui-react': patch
'@atom63/cli': patch
---

Vertical Tabs in the default variant: the track now grows with its stacked tabs and the raised indicator slides vertically to the selected tab.

TextTicker with `autoPlay` now pauses while its text is hovered or the ticker holds focus, and renders a pause toggle (WCAG 2.2.2). The new `paused` prop hands pausing to the caller and removes the toggle; `pauseLabel` names it. Under reduced motion the ticker stays still and shows no toggle. A caller's `ref` on a marquee TextTicker now reaches the root without breaking overflow measurement; the text sits in a new `.a63-TextTicker-viewport` element that carries the clip and edge fade.
