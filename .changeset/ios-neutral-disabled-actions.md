---
'@atom63/ui-ios': minor
---

Add `AtomThemeColors.actionDisabledBackground`, `actionDisabledForeground` and `actionDisabledBorder` and the matching `AtomTokens.Color` values, generated from the `--a63-action-disabled-*` tokens. A disabled `AtomButtonStyle` with solid, soft or outline emphasis now draws them, matching the web, instead of fading the whole control; a ghost button fades only its label. A loading `AtomButton` keeps its look.
