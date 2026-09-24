# MDX Block Review

Working review of public `@atom63/mdx/blocks` components by author intent.

## Intent Groups

| Intent | Blocks | Shared foundation |
|--------|--------|-------------------|
| Disclosure | `Accordion`, `Tabs`, `CreditsBlock` | `@atom63/ui-react` primitives |
| Notice / takeaway | `Callout`, `KeyIdea` | `src/foundations/notice` |
| Framed reference | `Compare`, `LayerStack` | `src/foundations/frame` |
| Technical surface | `CodeBlock`, `DocExample`, `DocExampleCode`, `MermaidDiagram` | `src/foundations/frame` (`TechnicalFrame`) |
| Media | `DemoStage`, `FigureBlock`, `VideoBlock`, `MediaCaption`, `MediaPlaceholder` | `src/foundations/media` + `src/foundations/frame` for staged demos |
| Comparison media | `ComparisonPair`, `ImageCompare` | Purpose-specific interactive blocks |
| Sequence / scrollytelling | `Steps`, `Timeline`, `ScrollStage` | `src/foundations/sequence` for static ordered flows |
| Page structure | `PageMeta`, `PageTableOfContents`, `MdxPageSkeleton` | Purpose-specific page chrome |
| Data / resources | `ColorSwatchItem`, `ResourceList`, `StatCard`, `StatGrid` | Purpose-specific static blocks |

## Block Notes

| Block | Status | Consumption | Notes |
|-------|--------|-------------|-------|
| `Accordion` | Keep | Design-system catalog / globally registered authoring block | Thin MDX spacing wrapper over `@atom63/ui-react`; good boundary. |
| `Callout` | Keep | Product content + design-system docs | Notice intent; slot and bare-child modes preserve back-compat. |
| `CodeBlock` | Keep | Provider-mapped fenced code + docs | Technical code surface; shares `TechnicalFrame`; embedded variant supports nested examples. |
| `ColorSwatchItem` | Keep | Design-system catalog | Token-doc utility; recipe now uses `--a63-*` checker colors. |
| `Compare` | Keep | Learn content + design-system catalog | Conceptual comparison; `Compare.Item` correctly owns tone recipe hooks. |
| `ComparisonPair` | Keep | Craft docs / demo content | Interactive before/after demo surface; distinct from conceptual `Compare`. |
| `CreditsBlock` | Keep | atom63.io project content + design-system catalog | Disclosure metadata; local motion and label override are appropriate. |
| `DemoStage` | Keep | atom63.io blog + craft docs | Non-hero staged surface for live demos or centerpiece visuals; uses frame foundation so page-openers stay on `PageMeta`. |
| `DocExample` | Keep | Design-system docs infrastructure | Technical tabbed example; shares `TechnicalFrame`; custom tab logic is justified until reused elsewhere. |
| `DocExampleCode` | Keep | Support-only helper for `DocExample` | Locked to `CodeBlock variant="embedded"` with regression coverage. |
| `ExampleContainer` | Keep | Design-system docs infrastructure | Live demo surface; exported from `@atom63/mdx/blocks`, not root. |
| `FigureBlock` | Keep | Provider-mapped docs/media authoring | Media foundation consumer; lightbox behavior is package-specific. |
| `ImageCompare` | Keep | Explicit authoring import, catalog/examples | Interactive media comparison; only header shares frame foundation because root/pointer behavior is special. |
| `KeyIdea` | Keep | Learn content + design-system catalog | Thin insight wrapper over notice foundation. |
| `LayerStack` | Keep | Learn content + authoring guide | Framed reference list; consider optional `id` on items before replacing index keys. |
| `MdxPageSkeleton` | Keep | Design-system + learn route loading states | Loading-only page chrome; intentionally not an authoring block. |
| `MediaCaption` | Keep | atom63.io media wrappers + catalog | Public lightweight caption import. |
| `MediaPlaceholder` | Review later | Story/catalog only | Looks media-like but does not yet use `MediaFigure`; could align if captions/asides are needed. |
| `MermaidDiagram` | Keep | Provider-mapped fenced mermaid | Technical diagram surface; renderer colors now use canonical `--a63-*`. |
| `PageMeta` | Keep | Learn article route | Page intro chrome; preferred content opener for MDX pages. |
| `PageTableOfContents` | Keep | Design-system + learn route chrome | Behavior-heavy page navigation; not a visual duplicate. |
| `ResourceList` | Keep | atom63.io blog content | External reference list; favicon behavior is specific. |
| `ScrollStage` | Keep | Design-system catalog / globally registered authoring block | Scrollytelling block; related to sequence intent but interaction model is distinct. |
| `StatCard` | Keep | Design-system catalog | Static metric card; trend colors moved to MDX recipe hooks. |
| `StatGrid` | Keep | Design-system catalog | Simple layout wrapper for stats. |
| `Steps` | Keep | Design-system catalog / globally registered authoring block | Static sequence; shares sequence foundation. |
| `Tabs` | Keep | Design-system catalog / globally registered authoring block | Thin MDX spacing wrapper over `@atom63/ui-react`; distinct from `DocExample` tabs. |
| `Timeline` | Keep | Design-system catalog / globally registered authoring block | Static dated sequence; shares sequence foundation. |
| `VideoBlock` | Keep | Provider-mapped docs/media authoring | Media foundation consumer with explicit caption policy. Add tests if expanded. |

## Follow-Up Candidates

- Decide whether `MediaPlaceholder` should become a `MediaFigure` variant.
- Add an optional `id` to `LayerStackItem` if stable keys matter for dynamic lists.
- Add focused tests for `VideoBlock` caption-policy rendering.
