---
'@atom63/styles': minor
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Adds `--a63-surface-raised-shadow`, a soft lift for borderless raised surfaces; aqua, retro and terminal point it at their own surface shadow. Card takes `variant="filled"` (muted fill, no border) and `variant="elevated"` (panel fill, soft shadow, no border). Button takes `variant="raised"` (panel fill, primary text, soft shadow, no border); with `shape="round"` it is the floating button over a map or a light photo. Web-only for now. ToggleGroup pills are now drawn by their muted fill alone, without a border. The Button contract and docs say when to use `default` (neutral solid) and `primary` (the main action in the brand colour).
