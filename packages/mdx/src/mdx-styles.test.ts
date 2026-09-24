import { describe, expect, it } from 'vitest'
import { mdxStyles, mdxTypography } from './mdx-styles'
import { articleNarrowProse } from './variants/article-narrow'
import { docMdxStyles } from './variants/docs'

describe('mdxStyles', () => {
  it('root is a non-empty string', () => {
    expect(mdxStyles.root).toBeTruthy()
    expect(typeof mdxStyles.root).toBe('string')
  })

  it('headings has h1-h6', () => {
    for (const key of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const) {
      expect(mdxStyles.headings[key]).toBeTruthy()
    }
  })

  it('content has expected keys', () => {
    const expectedKeys = [
      'link',
      'strong',
      'pre',
      'code',
      'table',
      'img',
      'blockquote',
      'ul',
      'ol',
      'li',
      'hr',
    ]
    for (const key of expectedKeys) {
      expect(mdxStyles.content).toHaveProperty(key)
    }
  })

  it('spacing has expected keys', () => {
    const expectedKeys = ['component', 'media', 'mediaLg', 'mediaSm']
    for (const key of expectedKeys) {
      expect(mdxStyles.spacing).toHaveProperty(key)
    }
  })

  it('keeps article paragraph and list item typography on the same recipe', () => {
    expect(mdxStyles.text.paragraph).toContain(mdxTypography.articleBody)
    expect(mdxStyles.content.li).toBe(mdxTypography.articleBody)
  })

  it('keeps docs paragraph and list item typography paired', () => {
    // Written literally, never composed at runtime — Tailwind's scanner is
    // static, so a class built at runtime never gets a rule generated for it.
    expect(docMdxStyles.root).toContain('[&>p]:text-base [&>p]:leading-[1.75]')
    expect(docMdxStyles.root).toContain('[&>ul>li]:text-base [&>ul>li]:leading-relaxed')
    expect(docMdxStyles.root).toContain('[&>ol>li]:text-base [&>ol>li]:leading-relaxed')
  })

  it('never expresses prose leading as a fixed step', () => {
    // `text-base` is `15px * --typography-scale`; a fixed leading (leading-6/7)
    // freezes while the text grows, cramping to ~1.24 at scale 1.5.
    expect(docMdxStyles.root).not.toMatch(/:leading-\d+(\s|$)/)
  })

  it('supports explicit column, wide, and bleed width intent in article and docs variants', () => {
    for (const variant of [articleNarrowProse, docMdxStyles.root]) {
      expect(variant).toContain("[&>[data-mdx-width='column']]")
      expect(variant).toContain("[&>[data-mdx-width='wide']]")
      expect(variant).toContain("[&>[data-mdx-width='bleed']]")
    }
    expect(articleNarrowProse).toContain('[&>div.not-mdx:not([data-mdx-width])]')
  })

  it('keeps the two figcaption paths in sync', () => {
    // Captions reach the page two ways — the component mapping (markdown images
    // and MediaCaption) and root selectors (raw JSX `<figure><figcaption>`).
    // They must render the same caption; they had drifted on text alignment.
    for (const token of ['mt-2', 'text-center', 'text-xs', 'leading-snug', 'text-balance']) {
      expect(mdxStyles.content.figcaption).toContain(token)
      expect(mdxStyles.root).toContain(`[&_figure>figcaption]:${token}`)
    }
  })

  it('breaks out img-only paragraphs in both the bare and lightbox-wrapped shapes', () => {
    // MdxImage wraps the <img> in a lightbox <button>, so a rule that only looks
    // for a direct <img> child matches nothing and every markdown image stays at
    // text width with paragraph spacing.
    expect(articleNarrowProse).toContain('[&>p:has(>img):not(:has(>:not(img)))]')
    expect(articleNarrowProse).toContain(
      '[&>p:has(>button[data-pswp-src]):not(:has(>:not(button)))]'
    )
  })

  it('sets the media rhythm on the image paragraph, not on the image recipe', () => {
    // `mdxStyles.content.img` cancels its own `my-8` via `first:mt-0 last:mb-0`:
    // remark always wraps a markdown image in a <p> where it is the only child,
    // so it is both first and last. The paragraph has to carry the spacing.
    expect(mdxStyles.content.img).toContain('first:mt-0')
    expect(articleNarrowProse).toContain(
      '[&>p:has(>button[data-pswp-src]):not(:has(>:not(button)))]:!my-8'
    )
  })

  it('points --mdx-measure at the narrow column so figcaptions match the prose', () => {
    expect(articleNarrowProse).toContain('[--mdx-measure:36rem]')
  })

  it('leaves horizontal table scrolling to the DS table container', () => {
    // The wrapper only clips to its own radius; `.a63-Table-container` inside it
    // is the real scroller, so an overflow here never scrolled.
    expect(mdxStyles.content.tableWrapper).not.toContain('overflow-x-auto')
  })

  it('keeps callout paragraph and list item typography on the compact recipe', () => {
    expect(mdxStyles.layout.callout.base).toContain(mdxTypography.calloutBody)
    expect(mdxStyles.layout.callout.base).toContain(
      '[&_p]:mt-1.5 [&_p]:text-base [&_p]:leading-relaxed'
    )
    expect(mdxStyles.layout.callout.base).toContain(
      '[&_li]:text-base [&_li]:leading-relaxed [&_li]:text-inherit'
    )
  })
})
