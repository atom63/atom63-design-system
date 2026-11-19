---
'@atom63/ui-react': patch
'@atom63/styles': patch
---

A pressed neutral Toggle now uses the high-emphasis neutral solid (`--a63-action-neutral`), so it is clearly different from an unpressed one in every theme. Before, it used the segment plate and looked the same as an unpressed toggle. Toggle, ToggleGroup, PanelSettingButton, Radio, Rating, Progress, the shared menu recipe and Tabs now repaint their selected, pressed, checked or highlighted state in the system `Highlight` colours in forced-colors mode. Under reduced motion, an indeterminate Progress fills its track with stripes instead of a still 40% bar. Menu group labels drop their 0.75 opacity, so they meet text contrast.
