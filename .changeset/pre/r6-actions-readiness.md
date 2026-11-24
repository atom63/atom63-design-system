---
'@atom63/ui-react': minor
---

Button: a loading button stays focusable (`aria-disabled` and blocked clicks and submits instead of native `disabled`), so a focused submit button keeps focus when it starts loading. New `nativeButton` prop: with `render` it defaults to `false`, so a rendered link gets no `type` or native `disabled`, and `disabled` sets `aria-disabled` and blocks the click. Label text is wrapped in `.a63-Button-text` and truncates with an ellipsis; the button is capped at its container's width. Aqua icon buttons no longer clip the root, so they keep the 44px coarse-pointer hit area, and a held (`data-pressed`) button takes the system selection colours in forced-colors mode.

Badge: label text is wrapped in `.a63-Badge-label` and truncates with an ellipsis; the badge is capped at its container's width.

Avatar: `AvatarBadge` takes `label` (visually hidden status text) and `AvatarGroupCount` takes `label` (the count in words for assistive technology); both prop types are exported. The status badge pins to the inline end, so it mirrors in right-to-left layouts, and it draws in the text colour in forced-colors mode. `ring={true}` is deprecated in favour of `ring="unseen"`.

SegmentedControl: label segments are named by their text only; `aria-label` and `title` are set only on icon segments.
