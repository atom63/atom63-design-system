---
'@atom63/mdx': patch
'@atom63/cli': patch
---

Document every `@atom63/mdx` block. A new docs page, "MDX blocks" (`atom63 docs pattern-mdx-blocks`), gives each of the 30 blocks what it is for, a working example and its props, read from the block's TypeScript types with defaults and doc comments. `atom63 api <Block>` now prints that section, so `atom63 api KeyIdea` answers with the purpose, an example and the props, not only the import line. The `@atom63/mdx` README points to the page.
