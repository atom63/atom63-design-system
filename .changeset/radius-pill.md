---
'@atom63/styles': minor
'@atom63/ui-react': patch
'@atom63/widgets': patch
---

Adds `--radius-pill`, a fixed `9999px` radius that stays a circle or capsule at any size and on every radius axis value, with a `rounded-pill` Tailwind theme entry. `--radius-full` is unchanged. Components that promise a circle or pill now use `--radius-pill`: Button `shape="round"`, the dashed Button, the spinner and the indicator, Switch, Radio, Slider, the toggle-group pills, Badge and carousel dots, the input-group button, the carousel, scrollable-list and lightbox overlay buttons, the scroll-area thumb, the card overlay button and cursor label, the widget state badge, and the Avatar and WidgetAvatar fallback radius. A round Button larger than 56px is now a circle instead of a rounded square.
