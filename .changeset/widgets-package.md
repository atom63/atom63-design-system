---
'@atom63/widgets': patch
---

Add `@atom63/widgets` to the design system: the widget foundation moved from atom63-vite. `@atom63/widgets` has the unit model (spans, presentation scale, type ramp, insets, `WidgetGrid`, `WidgetViewport`), `WidgetImage` and the link and destination helpers; `@atom63/widgets/primitives` has `WidgetSurface`, `WidgetCard` and its parts, `WidgetBlock` and `WidgetAvatar`; `@atom63/widgets/state` has `WidgetStateFeedback` and the state helpers; `@atom63/widgets/runtime` has `WidgetHostedShell`, the transitions, the loading shell and the error fallback. The components no longer need the consumer's Tailwind: import `@atom63/widgets/styles.css` after the `@atom63/ui-react` recipes. `WIDGET_RIM_SHELL_CLASS` and `WIDGET_CARD_SURFACE_CLASS` now hold the stylesheet's class names, `cn` joins classes without merging them, and the state and fallback icons are lucide icons. The host chrome and the collection views stay in atom63-vite.
