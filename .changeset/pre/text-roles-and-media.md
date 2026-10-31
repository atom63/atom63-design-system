---
'@atom63/styles': minor
---

Text roles, an 11px step and media roles.

- Text roles named after the Apple HIG text styles: `large-title`, `title-1`, `title-2`, `title-3`, `headline`, `body`, `callout`, `subhead`, `footnote`, `caption-1` and `caption-2`. Each has `--a63-type-<role>-font-size`, `-line-height`, `-font-weight` and `-font-weight-strong`, on a step of the web scale, with its iOS `Font.TextStyle` recorded in the token source. Tailwind gets `text-<role>` and `text-<role>-strong`, which set size, line height and weight together.
- A `2xs` step (11px on 13px) at the bottom of the type scale, with `text-2xs`.
- `--a63-media-surface`: an opaque dark neutral for media areas that does not follow the mode. The roles table exposes `media-stage`, `media-surface`, `media-scrim` and the `on-media-*` tokens to Tailwind and the shadcn bridge.
