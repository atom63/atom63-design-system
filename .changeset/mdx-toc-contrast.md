---
'@atom63/mdx': patch
---

Keep `PageTableOfContents` and `ComparisonPair` text at 4.5:1 in light mode. Inactive inline links,
inactive depth-3 rail links and the comparison badge and switch labels now read in
`--a63-text-secondary` at full strength instead of an alpha-dimmed mix of a text token, which
dropped depth-3 links to 3.31:1 on a light surface. Depth-3 links still step down through their
smaller size and indent.
