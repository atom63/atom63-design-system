---
'@atom63/ui-foundation': patch
'@atom63/ui-react': patch
---

`@atom63/ui-foundation` exports accessibility pattern contracts: the WAI-ARIA APG dialog (modal),
alert dialog, menu button and tabs patterns as data (`dialogModalPattern`, `alertDialogPattern`,
`menuButtonPattern`, `tabsPattern`, `a11yPatterns`, `getA11yPattern`) with their types. The Dialog,
AlertDialog, DropdownMenu and Tabs contracts gain an `accessibility` field that names the pattern
the component implements, its option values and any known gaps.

`AlertDialogPopup` in `@atom63/ui-react` sets `aria-modal="true"`, as the APG alert dialog pattern
requires.
