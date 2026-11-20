---
'@atom63/ui-react': patch
---

SegmentedControl, NavigationMenu and Command now repaint their selected segment, open trigger, current link and highlighted option in the system `Highlight` colours in forced-colors mode. NavigationMenuLink draws the control focus ring as an inset outline on `:focus-visible`, and the current link (`active`) gets a heavier label, so it no longer looks like the hover fill. ChatTypingIndicator mounts its `status` region empty and then adds the label as visually hidden text, so screen readers announce it, and its dots stay visible in forced-colors mode. A streaming ChatMessage leaves off `aria-busy` while one of its direct children is a ChatTypingIndicator.

Menu, DropdownMenu, ContextMenu, Menubar and Select items now draw the control focus ring as an inset outline on `:focus-visible`, on top of the highlight fill. A pointer hover still shows only the fill. Autocomplete and Command options keep focus in the input, so the highlighted option, the one Enter picks, always carries the inset ring.
