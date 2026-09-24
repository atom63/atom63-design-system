/**
 * MDX STYLES - Consolidated style definitions
 * Extracted to separate file to avoid circular dependencies
 *
 * IMPORTANT: Two styling paths exist for MDX elements:
 *
 * 1. Component mapping (mdxComponents) — applies to markdown syntax (e.g. ![alt](src))
 *    and lowercase HTML tags that MDX routes through the provider. Styles live in
 *    `mdxStyles.content.*` and are applied via `cn()` in each component.
 *
 * 2. Root selectors (below) — apply to raw JSX written directly in MDX files
 *    (e.g. <figure><video ... /></figure>). These bypass the component mapping,
 *    so styles must be applied via descendant selectors on the root wrapper.
 *
 * When changing spacing/styles for media or figures, update BOTH paths or the
 * styling will be inconsistent between markdown syntax and raw JSX usage.
 */

const inlineLinkTreatment = '[&_a]:underline [&_a]:underline-offset-4'

/* Prose leading is expressed as a RATIO, never a fixed step. `text-base` is
 * `15px * --typography-scale` (a user-adjustable personalization axis), so a
 * fixed `leading-7` freezes at 28px while the text grows — 1.87 at scale 1,
 * but 1.24 at scale 1.5, where lines nearly collide.
 *
 * Scoped classes (`[&>p]:text-base`, …) are always written out literally at the
 * point of use. They cannot be composed from these tokens by a helper: Tailwind's
 * scanner is a static lexer over source text, so a class assembled at runtime is
 * never seen and no rule is generated for it. */
export const mdxTypography = {
  articleBody: 'text-base leading-relaxed text-secondary-foreground',
  articleBodySpacing: 'mt-4 first:mt-0 last:mb-0',
  calloutBody: 'text-base leading-relaxed',
} as const

export const mdxStyles = {
  // wrapper you put around MDX content container (highly recommended)
  // Note: .not-mdx, .example-container, and .component-preview will opt-out of all typography styles
  root: [
    // `.mdx` is the class hook; foundation color lives in mdx-blocks.css
    // (`.mdx { color: var(--a63-text-primary) }`). Color/surface/border/radius
    // for raw-JSX figures + media are likewise in mdx-blocks.css so this layer
    // needs no Tailwind utility generation. Only geometry stays as utilities.
    'mdx',
    // Raw JSX figures bypass component mapping — spacing via root selectors.
    // (figure>video|img|iframe|figcaption color/border/radius → mdx-blocks.css)
    '[&_figure]:my-8 [&_figure:first-child]:mt-0 [&_figure:last-child]:mb-0 sm:[&_figure]:my-10',
    '[&_figure>figcaption]:mx-auto [&_figure>figcaption]:mt-2 [&_figure>figcaption]:max-w-[var(--mdx-measure,42rem)] [&_figure>figcaption]:text-center [&_figure>figcaption]:text-xs [&_figure>figcaption]:leading-snug [&_figure>figcaption]:text-balance',
    // Reset only the live demo wrapper; rendered components keep their own internal rhythm.
    '[&_.example-container_.not-mdx]:!m-0',
    '[&_.not-mdx:not(.example-container):not(.callout):not(.mdx-block):not(.mdx-page-meta):not(.mdx-page-nav):not([data-media])]:!m-0',
    '[&_.not-mdx>a]:!no-underline',
    '[&>.callout+.callout]:mt-4',
    '[&_.foundation-preview_p]:!m-0 [&_.foundation-preview_p]:![font-size:unset] [&_.foundation-preview_p]:![line-height:unset]',
    // .example-container — MDX typography is suppressed via React Context (useMdxStyle hook),
    // so no CSS overrides are needed here. Components inside control their own styles.
  ].join(' '),

  spacing: {
    block: 'my-6 first:mt-0 last:mb-0 sm:my-8',
    component: 'my-5 first:mt-0 last:mb-0',
    media: 'my-8 first:mt-0 last:mb-0 sm:my-10',
    mediaLg: 'my-12 first:mt-0 last:mb-0 sm:my-16',
    mediaSm: 'my-6 first:mt-0 last:mb-0',
  },

  headings: {
    h1: 'text-4xl font-semibold tracking-tight scroll-mt-24 mt-10 first:mt-0 sm:text-5xl',
    h2: 'text-2xl font-semibold tracking-tight scroll-mt-24 mt-10 first:mt-0 sm:text-3xl',
    h3: 'text-xl font-semibold tracking-tight scroll-mt-24 mt-8 first:mt-0 sm:text-2xl',
    h4: 'text-lg font-semibold tracking-tight scroll-mt-24 mt-6 first:mt-0',
    h5: 'text-base font-semibold scroll-mt-24 mt-6 first:mt-0',
    h6: 'mdx-h6 text-sm font-semibold scroll-mt-24 mt-6 first:mt-0',
  },

  text: {
    paragraph: `${mdxTypography.articleBody} ${mdxTypography.articleBodySpacing} ${inlineLinkTreatment}`,
    lead: 'mdx-text-secondary text-lg leading-relaxed mt-4 first:mt-0',
    small: 'mdx-text-secondary text-sm leading-relaxed',
  },

  // NOTE (tailwind-independence): FOUNDATION styling (color / surface / border /
  // shadow / radius) for these elements lives in styles/mdx-blocks.css keyed on
  // --a63-* and applied via the `.mdx-*` recipe classes referenced below.
  // Only LAYOUT/TYPOGRAPHY geometry stays as Tailwind utilities here; those are
  // pure geometry and override cleanly via @layer components.
  content: {
    // links — decoration color still Tailwind (decorative underline tint, no
    // --a63-* equivalent; renders via shadcn compat when Tailwind is present)
    link: 'font-normal underline underline-offset-4 decoration-2 decoration-foreground/30 hover:decoration-foreground/70 transition-colors',

    // emphasis (color via `.mdx strong`/`.mdx del` recipes in mdx-blocks.css)
    strong: 'font-semibold',
    em: 'italic',
    del: 'line-through',
    ins: 'mdx-ins underline',

    // inline code
    inlineCode: 'mdx-inline-code px-1 py-0.5 font-mono text-xs leading-snug font-medium',

    // code blocks (pre)
    pre: 'mdx-pre overflow-x-auto p-4 text-sm leading-relaxed [&_code]:bg-transparent [&_code]:border-0 [&_code]:p-0 [&_code]:font-normal [&_code]:leading-relaxed [&_code]:ring-0 [&_code]:text-sm',
    code: 'font-mono text-sm leading-relaxed font-normal', // used inside <pre><code>

    // blockquote
    blockquote:
      'mdx-blockquote mt-6 px-4 py-3 text-base italic rounded-e [&_p]:mt-2 [&_p:first-child]:mt-0',

    // lists
    ul: `mt-4 list-disc space-y-2 ps-4 [&_ul]:mt-2 [&_ul]:space-y-2 [&_ul]:ps-4 ${inlineLinkTreatment}`,
    ol: `mt-4 list-decimal space-y-2 ps-4 [&_ol]:mt-2 [&_ol]:space-y-2 [&_ol]:ps-4 ${inlineLinkTreatment}`,
    li: mdxTypography.articleBody,

    // hr
    hr: 'mdx-hr my-8 sm:my-10',

    // kbd
    kbd: 'mdx-kbd inline-flex h-6 select-none items-center gap-1 px-2 font-mono text-xs font-medium',

    // tables (wrap recommended)
    /* Clips to the wrapper's own radius/border only. The horizontal scroller is
     * the DS Table's `.a63-Table-container` inside it, so an `overflow-x-auto`
     * here never scrolled — its scrollWidth always equalled its clientWidth. */
    tableWrapper: 'mdx-table-wrapper mt-6 w-full overflow-hidden sm:mt-8',
    table: 'w-full border-collapse text-sm [&_code]:text-xs',
    thead: 'mdx-thead',
    tbody: '[&_tr:last-child]:border-0',
    tr: 'mdx-tr transition-colors',
    th: 'mdx-th h-9 px-3 text-start align-middle font-semibold',
    td: 'mdx-td px-3 py-2 align-middle',
    caption: 'mdx-caption mt-3 text-balance text-xs',

    // media — vertical rhythm aligned with spacing.media / mediaLg tokens
    // (rounded/border color for iframe/video via `.mdx-media-framed` recipe)
    img: 'my-8 rounded-xl first:mt-0 last:mb-0 sm:my-10',
    figure: 'my-8 first:mt-0 last:mb-0 sm:my-10',
    /* A caption labels the media above it, so it sits close and reads quiet.
     * `leading-relaxed` (1.625) is prose leading: on a one-line caption its
     * half-leading added ~4px of dead space on top of the margin, so a 12px gap
     * measured ~16px optically and the caption drifted free of its own image.
     * `snug` + `mt-2` lands it at ~10px. Ratio leading, never a fixed step. */
    figcaption:
      'mdx-figcaption mx-auto mt-2 max-w-[var(--mdx-measure,42rem)] text-center text-xs leading-snug text-balance',
    iframe: 'mdx-media-framed my-8 first:mt-0 last:mb-0 w-full rounded-xl sm:my-10',
    video: 'mdx-media-framed my-8 first:mt-0 last:mb-0 w-full rounded-xl sm:my-10',
    audio: 'my-8 first:mt-0 last:mb-0 w-full sm:my-10',

    // details/summary
    details: 'mdx-details mt-6 p-4 [&>*:first-child:not(summary)]:mt-0 [&>summary+*]:mt-3',
    summary:
      'mdx-summary cursor-pointer select-none font-semibold [&::-webkit-details-marker]:hidden',

    // misc semantics
    mark: 'mdx-mark rounded-sm px-1',
    sub: 'text-xs align-sub',
    sup: 'text-xs align-super',
    abbr: 'mdx-abbr cursor-help',
    cite: 'mdx-cite italic',
    dfn: 'font-semibold',
    time: 'mdx-time',
    var: 'font-mono italic',
    samp: 'mdx-samp px-1 font-mono text-xs',
    output: 'mdx-output px-2 py-1 font-mono text-xs',
  },

  layout: {
    callout: {
      // Scoped classes are written out literally, never composed by a helper:
      // Tailwind's scanner is static, so a class assembled at runtime is never
      // seen and no rule is generated for it.
      base: `my-4 rounded-lg border p-4 ${mdxTypography.calloutBody} first:mt-0 last:mb-0 sm:my-5 [&_p]:mt-1.5 [&_p]:text-base [&_p]:leading-relaxed [&_p:first-child]:mt-0 [&_ul]:mt-1.5 [&_ul]:space-y-1 [&_ol]:mt-1.5 [&_ol]:space-y-1 [&_li]:text-base [&_li]:leading-relaxed [&_li]:text-inherit`,
    },
  },
} as const

export type CalloutType = 'info' | 'warning' | 'error' | 'success'
