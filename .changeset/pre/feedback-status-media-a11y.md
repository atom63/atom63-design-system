---
'@atom63/ui-react': minor
'@atom63/mdx': minor
'@atom63/widgets': patch
---

Fix feedback, status and media accessibility gaps from the readiness review:

- `Alert`'s info, success and warning action labels use their status `-subtle-foreground` text step, so they reach 4.5:1 on the tinted fill in every theme and mode. The live region follows the tone: error and warning render `role="alert"` (assertive); default, info and success render `role="status"` (polite). Pass `role` to override.
- `EmptyErrorDetail`'s "Show details" toggle is a muted ghost Button, so its label rests in the secondary text colour (4.5:1) instead of a 60% mix of it.
- `FeedbackState` keeps one live region mounted in every state: polite (`role="status"`) for loading and the result states, assertive (`role="alert"`) for an error. It is no longer `aria-busy` while loading, which silenced it. Its title is a heading, level 3 unless `level` sets another.
- `LoadMoreTrigger`'s Retry action gets a hit area of `--a63-control-min-target` (44px on coarse pointers) around its text.
- `@atom63/mdx` `VideoBlock` does not autoplay when the reader prefers reduced motion. An autoplaying video without `controls` gets a pause and play toggle (an overlay Button named by `pauseLabel` and `playLabel`), and a decorative video without controls is `aria-hidden` instead of labelled.
- `@atom63/widgets` controls reach a 44 physical px hit area on coarse pointers: inside a widget, a Button's hit area grows to `--widget-interaction-target` while the control keeps its 24px proportion.
