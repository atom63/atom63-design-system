---
'@atom63/styles': patch
'@atom63/cli': patch
---

Darken the light-mode `--a63-category-pink-subtle-foreground` and
`--a63-category-rose-subtle-foreground` from the 700 to the 800 step, so tinted pink and rose chips
and icon tiles (`bg-category-pink-subtle text-category-pink-subtle-foreground`) hold 4.5:1 on their
own wash in every theme; they measured 4.42:1 and 4.41:1 in Aqua. A new contrast test checks every
status and category `-subtle-foreground` on its wash over the page and the panel.
