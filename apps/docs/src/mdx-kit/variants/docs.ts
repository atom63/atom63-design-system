/**
 * Doc-specific overrides layered on top of mdxStyles.root.
 *
 * Body copy (p, ul, ol, li, blockquote) inherits sizing from the base
 * mdxStyles — this file only adds layout and structural overrides
 * unique to the component catalog / reference pages.
 */

export const docMdxStyles = {
  root: [
    'ds-doc max-w-none',
    // Reference prose — compact enough for token docs, still readable for explanation.
    // Written out literally, never composed from a token at runtime: Tailwind's
    // scanner is static, so a class built at runtime is never seen and the rule
    // is never generated.
    // Leading is a RATIO — `text-base` is `15px * --typography-scale`, so a fixed
    // step (leading-7) freezes at 28px and cramps to 1.24 as the user scales type up.
    '[&>p]:max-w-3xl [&>p]:text-base [&>p]:leading-[1.75] [&>p]:text-muted-foreground',
    '[&>ul]:max-w-3xl [&>ul]:space-y-1.5 [&>ol]:max-w-3xl [&>ol]:space-y-1.5',
    '[&>ul>li]:text-base [&>ul>li]:leading-relaxed [&>ol>li]:text-base [&>ol>li]:leading-relaxed',
    '[&>p+ul]:mt-2.5 [&>p+ol]:mt-2.5 [&>ul+p]:mt-4 [&>ol+p]:mt-4',
    '[&>ul+ul]:mt-3 [&>ol+ol]:mt-3 [&>ul+ol]:mt-3 [&>ol+ul]:mt-3',
    '[&>blockquote]:max-w-3xl [&>blockquote]:text-sm [&>blockquote]:leading-[1.75]',
    // Page title + lead — the title carries hierarchy through size, not weight,
    // so it stays clearly above the h2 ramp without shouting.
    '[&>h1]:mb-2 [&>h1]:font-medium [&>h1]:text-4xl [&>h1]:tracking-tight sm:[&>h1]:text-5xl',
    '[&>h1+p]:mt-0 [&>h1+p]:mb-9 [&>h1+p]:max-w-3xl [&>h1+p]:text-base [&>h1+p]:leading-[1.75] [&>h1+p]:text-muted-foreground',
    // Section headings — smaller than article for catalog density
    '[&>h2]:mt-10 [&>h2]:mb-2 [&>h2]:scroll-mt-24 [&>h2]:font-semibold [&>h2]:text-lg [&>h2]:tracking-tight [&>h2]:first:mt-10 sm:[&>h2]:text-xl',
    '[&>h2+p]:mt-0 [&>h2+p]:mb-4 [&>h2+p]:max-w-3xl',
    '[&>h3]:mt-8 [&>h3]:mb-2 [&>h3]:font-semibold [&>h3]:text-base [&>h3]:tracking-tight',
    '[&>h3+p]:mt-0 [&>h3+p]:mb-3',
    '[&>h4]:mt-6 [&>h4]:mb-2 [&>h4]:font-medium [&>h4]:text-sm',
    // Portable blocks — doc-scale spacing
    '[&>.callout]:my-4 [&>.callout]:sm:my-5 [&>.callout+.callout]:mt-4',
    '[&>.example-container]:my-5',
    '[&>.foundation-preview]:my-5',
    '[&>[data-media]]:my-7',
    '[&>header.not-mdx]:my-8 [&>header.not-mdx]:gap-3',
    '[&>header.not-mdx_h1]:mt-0 [&>header.not-mdx_h1]:font-medium [&>header.not-mdx_h1]:text-4xl [&>header.not-mdx_h1]:tracking-tight',
    '[&>header.not-mdx_p]:mt-0 [&>header.not-mdx_p]:text-base [&>header.not-mdx_p]:leading-relaxed [&>header.not-mdx_p]:text-muted-foreground',
    '[&>div.not-mdx]:my-5',
    '[&>hr]:my-8',
    '[&>.mdx-table-wrapper]:my-6',
    // Code
    '[&_.not-prose>p]:m-0',
    '[&_p_code]:rounded-sm [&_p_code]:px-1 [&_p_code]:py-0 [&_p_code]:text-[0.875em] [&_p_code]:font-medium',
    '[&_li_code]:rounded-sm [&_li_code]:px-1 [&_li_code]:py-0 [&_li_code]:text-[0.875em] [&_li_code]:font-medium',
    '[&>.code-block]:my-5 [&>p+.code-block]:mt-4 [&>.code-block+p]:mt-4 [&>.code-block+h2]:mt-12 [&>.code-block+h3]:mt-8',
    '[&_pre]:m-0 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/25 [&_pre]:p-4',
    '[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:font-mono [&_pre_code]:text-sm [&_pre_code]:font-normal [&_pre_code]:leading-relaxed [&_pre_code]:shadow-none [&_pre_code]:ring-0',
    '[&_.not-prose_pre]:m-0 [&_.not-prose_pre]:rounded-none [&_.not-prose_pre]:border-0 [&_.not-prose_pre]:bg-transparent [&_.not-prose_pre]:p-0 [&_.not-prose_pre]:shadow-none',
    '[&_.not-prose_pre_code]:border-0 [&_.not-prose_pre_code]:bg-transparent [&_.not-prose_pre_code]:p-0 [&_.not-prose_pre_code]:shadow-none',
    '[&_.mdx-table-wrapper_table]:text-sm [&_.mdx-table-wrapper_th]:h-10 [&_.mdx-table-wrapper_th]:px-3 [&_.mdx-table-wrapper_td]:px-3 [&_.mdx-table-wrapper_td]:py-2.5',
    '[&_.ds-api-table]:mt-2',
    // Explicit block intent: prose stays compact, visual blocks share one wide measure.
    "[&>[data-mdx-width='column']]:mx-auto [&>[data-mdx-width='column']]:w-full [&>[data-mdx-width='column']]:max-w-[var(--mdx-measure,42rem)]",
    "[&>[data-mdx-width='wide']]:mx-auto [&>[data-mdx-width='wide']]:w-full [&>[data-mdx-width='wide']]:max-w-[var(--mdx-measure-wide,72rem)]",
    "[&>[data-mdx-width='bleed']]:mx-0 [&>[data-mdx-width='bleed']]:w-full [&>[data-mdx-width='bleed']]:max-w-none",
  ].join(' '),
} as const
