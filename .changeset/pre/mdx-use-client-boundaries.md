---
'@atom63/mdx': patch
---

Mark every client component with `'use client'` so it keeps a client boundary in React Server Components. CodeBlock, CreditsBlock, DemoConfigPanel, DocExample, FigureBlock, MermaidDiagram, PageTableOfContents, the figure lightbox host, the MDX components map, the live preview, the source editor and view, Reveal, Stagger and the example context called hooks without the directive, so the build shipped them unmarked and a server component that imported them failed. Each block folder's barrel now builds one file per module, as the public entries do, so DemoConfigPanel sits apart from the server-safe DemoStage.
