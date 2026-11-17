---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Add a `layout` axis to ChatComposer (`chatComposerLayouts`, `ChatComposerLayout`). The new default, `inline`, is one pill row: the attach slot, the field, then the actions and the send button. It grows into a block, with the controls in a row under the text, once the text wraps or has a line break. `layout="stacked"` keeps the previous two-row composer. The send and stop buttons are now neutral solid circles (`variant="default"`) instead of primary. A new `onVoice` prop (with `voiceIcon` and `voiceLabel`) shows a voice button in place of the send button while the field is empty.
