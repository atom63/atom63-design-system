---
'@atom63/styles': minor
'@atom63/cli': patch
---

`--a63-chart-2` to `--a63-chart-5` now turn the hue of `--a63-chart-1` (the brand) by fixed steps at a set lightness and chroma, instead of fixed teal, amber, violet and rose, so no series lands on the brand on any brand, the violet brand and wallpaper brands included. Every series reaches 3:1 against the page and the panel in every theme and mode, and in dark mode `--a63-chart-1` is the brand's 400 step. `@atom63/styles/compat/a63-from-shadcn` maps the chart tokens from shadcn's `--chart-1..5`. The content-colour rule now points chart series at the chart tokens and the Chart component.
