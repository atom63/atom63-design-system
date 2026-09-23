# Atom63 product-shell example

A design-system-owned application presentation layer. This is intentionally richer than `examples/vite-basic`, but it does not import atom63.io routes, content, manifests, or portfolio-specific policies.

Use it to validate generic app composition:

- `Atom63Theme` as the first-use theme boundary
- shared CSS tokens and recipe styles
- cards, tabs, inputs, badges, empty state, and buttons in a realistic shell
- responsive app layout that can inform downstream product consumers

`atom63-vite` remains the real portfolio consumption layer. If this example needs product-specific content to make sense, the code belongs in `atom63-vite`, not here.

```bash
pnpm --filter atom63-product-shell-example build
```
