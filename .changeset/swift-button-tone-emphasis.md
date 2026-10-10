---
'@atom63/ui-ios': minor
---

Button takes `tone` (neutral, primary, destructive) and `emphasis` (solid, soft, outline, ghost), generated from the button contract, and `AtomButtonStyle` is public so a native `Button` can use the Atom63 look. `variant:` still works and is deprecated; each `AtomButtonVariant` maps to one tone × emphasis. Badge gains the `info` and `error` tones; `danger` is a deprecated name for `error`.
