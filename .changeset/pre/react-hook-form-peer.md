---
'@atom63/ui-react': patch
---

`react-hook-form` is now a peer dependency instead of a bundled dependency. `Form` binds to the
consumer's `useForm` through react-hook-form context, so both must resolve to the same installed
copy; a separately installed version would give each side its own context. Install
`react-hook-form@^7.81.0` alongside `@atom63/ui-react` if your package manager does not add peers
automatically.
