---
'@atom63/ui-ios': minor
---

Add `atomInform(_:route:store:)`, which presents what `AtomInformArbiter` resolves: a banner inset at the top, a dialog as an alert or, with more than two actions, a sheet, and up to three flyouts at the bottom edge. `AtomInformDismissalStore` is now `@Observable`, so a dismissal updates the view.
