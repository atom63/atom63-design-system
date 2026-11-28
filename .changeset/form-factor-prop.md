---
'@atom63/ui-react': minor
---

`Atom63Theme` and `UIProvider` take `formFactor`. `formFactor="phone"` stamps `data-a63-form-factor="phone"`, so an app gets a phone's type steps and control sizing without `AppView layout="phone"`, which also makes `<main>` the scroll container. The typography docs say to set the same attribute on `<html>` for portaled overlays.
