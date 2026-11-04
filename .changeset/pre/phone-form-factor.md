---
'@atom63/styles': minor
---

Add the phone form factor. `[data-a63-form-factor='phone']` sets the type steps to the iOS text sizes (body 17px, subhead 15px, footnote 13px, title-2 22px, large-title 34px) and control sizing to the iOS ramp (36/40/44/48/52px, labels at body size) inside it. The text roles are redeclared on that scope, so `text-body` and the other roles follow it. The page outside the scope is unchanged.
