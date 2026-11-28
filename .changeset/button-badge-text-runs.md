---
'@atom63/ui-react': patch
---

Button and Badge keep interpolated text in one label again. `<Button>归到「{name}」</Button>` and `<Badge>{code} {name}</Badge>` rendered each JSX child as its own flex item, so the label gap split one phrase and spaces between expressions were trimmed away. Each run of adjacent text children now goes in one `button-text` or `badge-label` span; only the space next to an icon is trimmed.
