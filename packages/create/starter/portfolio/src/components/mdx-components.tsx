import { createMdxComponents } from '@atom63/mdx/article'
import type { ReactNode } from 'react'

/**
 * A block of your own: a quote from someone you worked with. Write
 * `<Quote by="…">…</Quote>` in any MDX file. Add more blocks the same way:
 * a component here, then a key in `createMdxComponents` below.
 */
function Quote({ by, children }: { by: string; children: ReactNode }) {
  return (
    <figure className="border-border my-8 border-s-2 ps-6">
      <blockquote className="text-foreground font-heading text-xl leading-snug">
        {children}
      </blockquote>
      <figcaption className="text-muted-foreground mt-3 text-start text-sm">{by}</figcaption>
    </figure>
  )
}

/**
 * Every MDX file renders with these: the core prose, the default @atom63/mdx
 * blocks (Callout, KeyIdea, Steps, StatGrid, FigureBlock, Timeline, …) and the
 * site's own Quote.
 */
export const mdxComponents = createMdxComponents({ Quote })
