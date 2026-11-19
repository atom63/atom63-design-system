---
'@atom63/ui-ios': minor
---

Toast: `AtomToast` takes `tone` (`AtomToastTone`: default, info, success, warning, error and loading, the web Toaster's tones) and `duration` (3 seconds by default, `nil` to stay until dismissed), and dismisses with a swipe up or the VoiceOver escape gesture. The default variant is now a card on the panel surface, like the web card, and `AtomToastView` shows a toast in place. `systemImage` is now optional and replaces the tone's symbol; a toast made with only a message no longer shows a checkmark, so pass `tone: .success` for that.

`AtomMessage` reads the sender and the message text to VoiceOver, then the time and status; before, the text was dropped. `AtomSyncStatusView(intent:label:)` takes a localized label, with the English text as the default. `AtomWidgetGrid` grows a row when a tile's content does not fit its cells, as at accessibility text sizes, instead of letting tiles overlap.
