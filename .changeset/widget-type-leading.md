---
'@atom63/widgets': patch
---

Give every `WIDGET_TYPE_RAMP` role its own unitless `leading`, so widget type no longer inherits the page's line height. `@atom63/styles` sets `body` to the body role with a fixed 23px line (#241), and roles without a leading picked that up: a 12.5px `body` row sat on a 23px line instead of the 1.5x it was designed on. `label`, `body`, `name`, `title` and `stat` now use 1.5, and `display` and `displayCompact` use 1, the value every shipped call site already passed. `chrome` (1) and `headline` (1.18) are unchanged, and a `leading` option still overrides the role.
