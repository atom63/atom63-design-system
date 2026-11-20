---
'@atom63/inform': patch
---

`InformSpotlight` now honours `dismissable` (default `true`) and `dismissLabel`: it shows a dismiss button in the bubble and closes on a press on the scrim as well as on Escape, so touch users have a way out. With `dismissable={false}` none of those close it. `InformDialog` with `dismissable={false}` now ignores Escape and outside presses instead of reporting a dismissal, and `InformOutlet` passes a message's `dismiss: 'none'` policy to the spotlight, so standing messages stay until an action resolves them.
