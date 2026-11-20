---
'@atom63/ui-react': patch
---

SegmentedControl, NavigationMenu and Command now repaint their selected segment, open trigger, current link and highlighted option in the system `Highlight` colours in forced-colors mode. NavigationMenuLink draws the control focus ring as an inset outline on `:focus-visible`, and the current link (`active`) gets a heavier label, so it no longer looks like the hover fill. ChatTypingIndicator mounts its `status` region empty and then adds the label as visually hidden text, so screen readers announce it, and its dots stay visible in forced-colors mode. A streaming ChatMessage leaves off `aria-busy` while one of its direct children is a ChatTypingIndicator.
