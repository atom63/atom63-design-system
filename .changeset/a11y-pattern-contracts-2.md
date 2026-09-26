---
'@atom63/ui-foundation': patch
---

`@atom63/ui-foundation` adds the WAI-ARIA APG select-only combobox, switch, checkbox, accordion
and radio group patterns as accessibility pattern contracts (`comboboxSelectOnlyPattern`,
`switchPattern`, `checkboxPattern`, `accordionPattern`, `radioPattern`). The Select, Switch,
Checkbox, Accordion and Radio contracts gain an `accessibility` field that names the pattern, its
option values and known gaps. `A11yPosition` accepts `checked`, and `A11yRole` and
`A11yPatternId` list the new roles and patterns.
