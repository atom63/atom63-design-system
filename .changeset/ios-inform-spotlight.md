---
'@atom63/ui-ios': minor
---

Add the inform spotlight on iOS: `atomInformAnchor(_:)` marks the view a spotlight message points at, and `atomInform` shows the resolved spotlight there as a TipKit popover whose only rule is the arbiter's choice. Closing the tip or choosing an action records the dismissal. Anchors inside the `atomInform` view count as available on their own. Spotlights need `Tips.configure()` at app launch.
