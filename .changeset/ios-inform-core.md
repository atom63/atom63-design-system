---
'@atom63/ui-ios': minor
---

Add the inform pattern's core to Atom63UI: `AtomInformMessage` and its surface, severity, dismiss mode, content and actions, `AtomInformContext`, `AtomInformArbiter.resolve` (a port of the web arbiter, checked against it with shared test vectors) and `AtomInformDismissalStore`, which keeps persistent dismissals in `UserDefaults` and session ones in memory.
