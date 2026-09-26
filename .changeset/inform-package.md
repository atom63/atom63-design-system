---
'@atom63/inform': patch
---

Add `@atom63/inform` to the design system: the message registry, the arbiter, the React runtime (`InformProvider`, `InformOutlet`, `useInform`) and the banner, dialog, corner flyout and spotlight surfaces, moved from atom63-vite. The surfaces no longer need the consumer's Tailwind: import `@atom63/inform/styles.css` after the `@atom63/ui-react` recipes. `SLOT_SIZE_CLASS`, `SEVERITY_BORDER_CLASS` and `SEVERITY_TEXT_CLASS` now hold the stylesheet's `.a63-Inform-*` class names instead of Tailwind utilities. Severity titles mix the status color toward the text color so they meet WCAG AA contrast, and the spotlight dialog is named by its title (or its body when it has none).
