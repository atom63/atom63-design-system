---
'@atom63/ui-react': minor
'@atom63/ui-foundation': patch
'@atom63/cli': patch
---

SegmentedControl is a radio group instead of a tab list: the root has `role="radiogroup"` and takes `aria-label` or `aria-labelledby`, each segment is a `radio`, Tab enters at the selected segment and the arrow keys move and select. The selected segment carries `data-checked` (it was `data-active`), and the indicator is placed by `--segment-indicator-*` (it was Base UI's `--active-tab-*`). `SegmentedControlProps` now extends Base UI's RadioGroup props instead of the Tabs root props. The look is unchanged. Use Tabs when the choices switch content panels.

Rating draws on stars filled in `--a63-status-warning` and off stars as outlines in `--a63-border-input`, so the two differ by shape as well as colour and both reach 3:1 against the page and the panel in every theme and mode.
