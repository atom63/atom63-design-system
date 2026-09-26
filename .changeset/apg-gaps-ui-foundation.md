---
'@atom63/ui-foundation': patch
---

The Dialog, Accordion and Select contracts drop the known gaps that `@atom63/ui-react` now closes:
`dialog-is-modal`, `header-controls-panel`, `home-opens-at-first`, `end-opens-at-last`,
`alt-up-arrow-selects` and `tab-selects`. The Select gap `combobox-active-descendant` stays, and
its reason now cites the APG Combobox pattern.
