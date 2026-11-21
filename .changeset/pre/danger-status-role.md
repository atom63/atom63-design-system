---
'@atom63/styles': minor
'@atom63/ui-react': patch
'@atom63/mdx': patch
'@atom63/cli': patch
---

Add the danger status role: `--a63-status-danger` (step 600 in light mode, 500 in dark mode) with `-foreground`, `-subtle` and `-subtle-foreground`, for error icons, borders and tints. `--a63-action-danger` stays the danger button fill. The contrast test now checks `--a63-status-danger` (3:1) and `--a63-text-danger` (4.5:1) in every theme and mode, and `compat/a63-from-shadcn.css` maps both from `--destructive`.

Alert's error tone draws its icon, border and fill from `--a63-status-danger` and its action label in `--a63-text-danger`, and its action sits at the inline end, so it no longer covers the title in right-to-left layouts. In `@atom63/mdx`, KeyIdea's eyebrow and the active PageTableOfContents link use `--a63-text-accent`; Compare's negative item, StatCard's down trend, the MermaidDiagram and live-preview error text use `--a63-text-danger`; the error Callout and Compare's negative marker use `--a63-status-danger`. The CLI agent index lists the new tokens.
