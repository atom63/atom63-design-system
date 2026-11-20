---
'@atom63/cli': minor
---

Index the public API. `atom63 api <name>` (and the `api` MCP tool) answers a SwiftUI type of `Atom63UI` with its declaration, doc comment and members, a JavaScript export with its import line and docs page, or a whole entry point such as `@atom63/ui-react/media` or `@atom63/mdx/blocks` with everything it exports. `search` finds these names too (`--kind api`), and `atom63 docs ios` reads the `Atom63UI` README. Docs pages in the index keep the code inside fenced blocks, including import, export and JSX lines, and new pages cover `@atom63/ui-react/media`, `@atom63/ui-react/media/lightbox`, `@atom63/ui-react/preview` and `@atom63/mdx`.
