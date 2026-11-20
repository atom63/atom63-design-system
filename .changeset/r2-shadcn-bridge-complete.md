---
'@atom63/styles': patch
---

The reverse shadcn bridge (`@atom63/styles/compat/a63-from-shadcn`) now defines every `--a63-*` token the `@atom63/ui-react` recipes read without a fallback: the space half steps, selected and disabled roles, subtle status and category colors, the display type roles, the app font, control feedback motion, icon sizes and the flat surface and overlay archetype slots. Colors derive from the shadcn variables, so they follow the host's light and dark mode. A shadcn host that loads only the bridge and the recipes no longer gets collapsed spacing or transparent selected states.
