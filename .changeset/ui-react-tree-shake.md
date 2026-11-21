---
'@atom63/ui-foundation': patch
'@atom63/ui-react': patch
---

The root entries of `@atom63/ui-react` and `@atom63/ui-foundation` now tree-shake. Each module the root re-exports is built as its own file, and the root is a list of re-exports over them, so a bundler drops the components an app does not import. One import from `@atom63/ui-react` now costs a consumer bundle 8.6 kB gzip for `Kbd` (was 35.6 kB), 11.1 kB for `Button` (was 37.8 kB), 10.6 kB for `Separator` (was 107.2 kB) and 22.2 kB for `Dialog` (was 107.1 kB). `toast` is re-exported through the toaster module, so sonner is loaded only by apps that use the toaster or `toast`. The public exports and types are unchanged.
