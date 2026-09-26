---
'@atom63/styles': patch
'@atom63/ui-react': patch
---

Fix five text-contrast issues that the Storybook axe checks started reporting once the surface mixes moved to oklab. The colors involved are unchanged on the default surfaces, so these issues predate that change; the checks did not report them before. `@atom63/styles` adds `--a63-text-danger` (danger 600 in light mode, 400 in dark mode) for danger text; `--a63-action-danger` stays the fill of danger buttons. In `@atom63/ui-react`, field and form errors and destructive menu items use `--a63-text-danger`, so they reach 4.5:1 on dark surfaces (they were about 2.7:1). A highlighted item in a primary-tone menu shows its shortcut in the highlight foreground. Sidebar and nav-tree group labels use `--a63-text-secondary` instead of a translucent foreground, which fell below 4.5:1 in the terminal theme. A selected row in a framed table fills its cells with the selection color; its white text previously sat on the page surface.
