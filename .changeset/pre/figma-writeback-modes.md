---
'@atom63/styles': patch
---

`tokens:apply` accepts version 2 token patches: a list of changes per Figma collection mode, each a literal value or an alias to another token. A change in a multi-mode collection (Mode, Brand, Surface) is written into the DTCG resolver context of that mode, and a re-pointed variable becomes a DTCG alias. Changes that cannot be written are listed with a reason, and nothing is written: an alias in code set to a raw value, a value computed in CSS, and a token shared by every brand but changed for one. Version 1 patches still apply.
