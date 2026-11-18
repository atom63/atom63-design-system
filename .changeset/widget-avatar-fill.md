---
'@atom63/widgets': patch
---

Make the WidgetAvatar face fill the token box even when a later same-layer `.a63-Avatar` default redeclares `--avatar-size`. The fill rule is now `.a63-WidgetAvatar .a63-WidgetAvatar-avatar`, sets `--avatar-size: 100%`, and sizes the face with `inline-size` and `block-size: 100%`.
