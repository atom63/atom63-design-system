---
'@atom63/styles': minor
'@atom63/ui-react': patch
---

Add `--a63-control-font-size-secondary`, set only by the phone form factor (subhead size, 15px). Item, Field, Form, Frame and ConnectedPanel descriptions read it with a fallback to `--a63-control-font-size-sm`, so on a phone a description sits below its 17px title and other scopes are unchanged.
