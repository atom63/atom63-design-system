---
'@atom63/ui-react': patch
'@atom63/cli': patch
---

`ScrollableList` no longer fades the bottom of small Buttons and Toggles. The list scrolls sideways only, so it now fades only its inline edges, and it pads the row by the amount a 32px control's 44px hit area sticks out (taking it back with a negative margin, so the row keeps its height), which keeps those hit areas tappable instead of clipped. `ScrollArea`'s `scrollFade` also accepts `"horizontal"`, `"vertical"` or `"both"` to fade only the edges of the axis that scrolls; `true` still fades all four edges. Fixes #386.
