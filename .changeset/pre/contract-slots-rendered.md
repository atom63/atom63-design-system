---
'@atom63/ui-foundation': patch
'@atom63/cli': patch
---

Button's contract slots are now the `data-slot` values the React Button renders: `button`, `button-label`, `button-spinner` and `button-indicator` (they were `root`, `label`, `icon`, `spinner` and `indicator`; no `icon` slot is rendered). Search Field's input slot is `input` (it was `search-field-input`). `buttonSlots`, `searchFieldSlots` and their `ButtonSlot` and `SearchFieldSlot` types change with them, and `atom63 component button` lists the new names. Rendered `data-slot` values are unchanged.
