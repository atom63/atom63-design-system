---
'@atom63/ui-foundation': patch
'@atom63/ui-react': patch
---

DestinationLink no longer draws an underline by default. Its default `plain` variant is for links behind cards, titles, icons and other surfaces that carry their own cue; set `variant="inline"` for an underlined text link in prose. The `card` variant added in the previous beta is renamed `plain`, since it is now the default.
