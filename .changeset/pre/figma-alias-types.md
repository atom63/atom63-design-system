---
'@atom63/styles': patch
---

Fix the Figma variable model (`@atom63/styles/figma-sync.json`): nine variables that alias font
stacks or easing curves were typed as numbers while their targets are strings, which Figma rejects
when the plugin writes the alias. They are now strings, like the variables they point at, and the
generator fails if an alias and its target ever disagree again.
