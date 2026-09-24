# MDX private foundations

This folder holds private implementation foundations grouped by author intent.
Public block APIs stay in `src/blocks/<name>` and public subpaths stay in
`package.json`.

- `media` — shared figure/frame/caption/spacing behavior for media blocks.
- `notice` — shared notice/insight structure behind `Callout` and `KeyIdea`.
- `sequence` — shared framed ordered-list rhythm behind `Steps` and `Timeline`.
- `example` — shared live-demo frame behind `ExampleContainer` and docs examples.
- `frame` — shared framed block/header and technical surface structure.

Do not import these from apps. Promote a private foundation only when it needs
a stable public contract and Storybook/API docs.
