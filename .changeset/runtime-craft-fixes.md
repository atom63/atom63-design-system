---
'@atom63/ui-react': patch
---

Disabled buttons keep their resting background, border and link underline under the pointer.
Switch and standalone Toggle draw their keyboard focus ring as an outline, so the ring shows in
themes whose control shadow is `none`; before, the `none` shadow made the whole ring declaration
invalid and no ring was drawn.
