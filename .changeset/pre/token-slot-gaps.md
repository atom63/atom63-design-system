---
'@atom63/ui-react': minor
'@atom63/styles': patch
'@atom63/cli': patch
---

Add two public token slots for things consumers used to reach into internals for (#366, #367).

- `DrawerContent` takes a `gutter` prop: how far a top or bottom drawer stops short of the opposite screen edge, as a CSS length. It sets the new public `--a63-drawer-gutter` variable on that drawer's viewport; a theme or `:root` can set the same variable for every drawer. The default stays 6rem, and the resolved value stays readable as `--a63-drawer-viewport-gutter`, so existing overrides keep working.
- `--a63-control-radius` is now documented as the public slot for the corner radius of controls in a scope. A container can set it to round the controls inside it (Button, Input, Textarea, Select, Badge, Tabs, menu triggers). Toggle, ToggleGroup and SegmentedControl keep their own slots. The radius foundation page has a new section on it.
