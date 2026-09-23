---
"@atom63/ui-react": patch
---

`@atom63/ui-react/styles.css` now includes the Tailwind utility classes the components render (layout, media, toaster, and appearance controls), compiled against the Atom63 Tailwind theme. Consumers without Tailwind no longer get unstyled layouts, unsized toast icons, or a spinner that does not spin; Tailwind consumers get harmless duplicates.
