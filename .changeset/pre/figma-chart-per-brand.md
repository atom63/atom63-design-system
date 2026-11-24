---
'@atom63/styles': patch
---

The Figma sync model carries each brand's chart series. `--a63-chart-2` to `--a63-chart-5` vary on brand and mode together, so each now has a hidden Brand variable per mode (`chart/2/light`, `chart/2/dark`) with the browser's value for every brand, and the token's Mode variable aliases the one for its mode. In Figma the series follow the layer's Brand and Mode modes instead of showing the default brand's colours. The four tokens leave `computed` and `atom63.computed-values.json`.
