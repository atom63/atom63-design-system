---
'@atom63/styles': minor
'@atom63/ui-react': minor
---

Add `--a63-action-disabled-background`, `--a63-action-disabled-foreground` and `--a63-action-disabled-border`, the neutral colors of a disabled action. They alias the muted surface, surface step 9 and the subtle border in each mode, so they follow every theme, brand and surface; the label keeps about 3:1 on the fill. A disabled Button with a fill or a border (default, primary, secondary, destructive, destructive-outline, outline and dashed) now draws a grey fill, a subtle border and a muted label instead of keeping its full fill and fading only the label. Ghost, link, overlay and glass still fade only the label, now with `--a63-action-disabled-opacity`. A loading Button keeps its look.
