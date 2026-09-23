/**
 * Narrow prose: text constrained to reading width, blocks and media full width.
 * Applied via ArticleMDXContentProvider (variant `narrow`).
 */
const narrowProse = [
  /* The narrow column is this variant's text measure, so `--mdx-measure` is
   * re-pointed at it. Everything that means "text column" — figcaption,
   * `data-mdx-width="column"`, Section `column` — then lands on the same
   * 36rem as the prose below, instead of inheriting the 42rem base default
   * and running wider than the paragraphs it belongs to. */
  '[--mdx-measure:36rem]',
  // Prose elements
  '[&>h1]:mx-auto [&>h1]:max-w-xl [&>h1]:w-full',
  '[&>h2]:mx-auto [&>h2]:max-w-xl [&>h2]:w-full',
  '[&>h3]:mx-auto [&>h3]:max-w-xl [&>h3]:w-full',
  '[&>h4]:mx-auto [&>h4]:max-w-xl [&>h4]:w-full',
  '[&>h5]:mx-auto [&>h5]:max-w-xl [&>h5]:w-full',
  '[&>h6]:mx-auto [&>h6]:max-w-xl [&>h6]:w-full',
  '[&>p]:mx-auto [&>p]:max-w-xl [&>p]:w-full',
  '[&>ul]:mx-auto [&>ul]:max-w-xl [&>ul]:w-full',
  '[&>ol]:mx-auto [&>ol]:max-w-xl [&>ol]:w-full',
  '[&>dl]:mx-auto [&>dl]:max-w-xl [&>dl]:w-full',
  '[&>blockquote]:mx-auto [&>blockquote]:max-w-xl [&>blockquote]:w-full',
  '[&>hr]:mx-auto [&>hr]:max-w-xl [&>hr]:w-full',
  '[&>details]:mx-auto [&>details]:max-w-xl [&>details]:w-full',
  // Callouts are prose and stay in the text column.
  '[&>.callout]:mx-auto [&>.callout]:max-w-xl [&>.callout]:w-full',
  /* Tables are data, not prose: pinned to the 36rem text column they overflowed
   * their own scroll container on desktop, where the overlay scrollbar is
   * invisible at rest, so the last column just looked cut off. They take the
   * wide column like code blocks — the horizontal scroll is the fallback for
   * tables wider than that, not the normal case. */
  '[&>.mdx-table-wrapper]:mx-auto [&>.mdx-table-wrapper]:w-full [&>.mdx-table-wrapper]:max-w-[var(--mdx-measure-wide,72rem)]',
  '[&>figure[data-rehype-pretty-code-figure]]:mx-auto [&>figure[data-rehype-pretty-code-figure]]:w-full [&>figure[data-rehype-pretty-code-figure]]:max-w-[var(--mdx-measure-wide,72rem)]',
  // Portable blocks (hero, credits) — same text column as prose
  '[&>header.not-mdx]:mx-auto [&>header.not-mdx]:max-w-xl [&>header.not-mdx]:w-full',
  '[&>div.not-mdx:not([data-mdx-width])]:mx-auto [&>div.not-mdx:not([data-mdx-width])]:max-w-xl [&>div.not-mdx:not([data-mdx-width])]:w-full',
  '[&>header.not-mdx+h2]:mt-8 [&>header.not-mdx+p]:mt-6',
  // Examples and media break out to full container width
  '[&>.example-container]:mx-0 [&>.example-container]:max-w-none [&>.example-container]:w-full',
  '[&>figure]:max-w-none [&>figure]:w-full',
  '[&>[data-media]]:w-full',
  /* An img-only paragraph is media, not prose: it breaks out of the text column
   * and takes the media rhythm. Two shapes have to be matched — the bare
   * `<p><img></p>` that MDX emits, and the `<p><button data-pswp-src><img></p>`
   * that MdxImage wraps it in for the figure lightbox. Only the bare shape was
   * covered, so every markdown image silently stayed at text width.
   *
   * The rhythm is set HERE rather than deferred to `mdxStyles.content.img`:
   * remark always wraps a markdown image in a paragraph, so that recipe's
   * `first:mt-0 last:mb-0` resolves against the <p> (the image is its only
   * child, hence both first and last) and cancels its own `my-8` every time. */
  '[&>p:has(>img):not(:has(>:not(img)))]:!my-8 sm:[&>p:has(>img):not(:has(>:not(img)))]:!my-10',
  '[&>p:has(>img):not(:has(>:not(img)))]:max-w-none [&>p:has(>img):not(:has(>:not(img)))]:w-full',
  '[&>p:has(>button[data-pswp-src]):not(:has(>:not(button)))]:!my-8 sm:[&>p:has(>button[data-pswp-src]):not(:has(>:not(button)))]:!my-10',
  '[&>p:has(>button[data-pswp-src]):not(:has(>:not(button)))]:max-w-none [&>p:has(>button[data-pswp-src]):not(:has(>:not(button)))]:w-full',
  // Explicit block intent wins over incidental element type (`div` vs `figure`).
  "[&>[data-mdx-width='column']]:mx-auto [&>[data-mdx-width='column']]:w-full [&>[data-mdx-width='column']]:max-w-[var(--mdx-measure,42rem)]",
  "[&>[data-mdx-width='wide']]:mx-auto [&>[data-mdx-width='wide']]:w-full [&>[data-mdx-width='wide']]:max-w-[var(--mdx-measure-wide,72rem)]",
  "[&>[data-mdx-width='bleed']]:mx-0 [&>[data-mdx-width='bleed']]:w-full [&>[data-mdx-width='bleed']]:max-w-none",
].join(' ')

export const articleNarrowProse = narrowProse
