import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@atom63/ui-react'
import { clsx } from 'clsx'
import type React from 'react'
import { createElement, useEffect, useState } from 'react'
import { Callout } from './blocks/callout/callout'
import { FigureBlock } from './blocks/figure-block/figure-block'
import {
  Accordion,
  CodeBlock,
  ColorSwatchItem,
  ComparisonPair,
  CreditsBlock,
  DemoStage,
  MediaCaption,
  MediaPlaceholder,
  MermaidDiagram,
  PageMeta,
  PageTableOfContents,
  ResourceList,
  ScrollStage,
  StatCard,
  StatGrid,
  Steps,
  Tabs,
  Timeline,
  VideoBlock,
} from './blocks/index'
import { ExampleContainer } from './example-container'
import { useIsInsideExample } from './example-context'
import { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from './lightbox/constants'
import { getImageDimensions, getRealImageDimensions } from './lightbox/dimensions'
import { FigureLightboxTrigger } from './lightbox/figure-lightbox-trigger'
import { isExternalMdxHref } from './mdx-external-href'
import { mdxStyles } from './mdx-styles'
import { getMdxStyle, hasSkipClass, useMdxStyle } from './use-mdx-style'

/** Portable block components registered on the default MDX map. */
export const blockMdxComponents = {
  Accordion,
  Callout,
  CodeBlock,
  ColorSwatchItem,
  ComparisonPair,
  CreditsBlock,
  DemoStage,
  ExampleContainer,
  FigureBlock,
  MediaCaption,
  MediaPlaceholder,
  MermaidDiagram,
  PageMeta,
  PageTableOfContents,
  ResourceList,
  ScrollStage,
  StatCard,
  StatGrid,
  Steps,
  Tabs,
  Timeline,
  VideoBlock,
} as const

export { mdxStyles, type CalloutType } from './mdx-styles'
export { hasSkipClass, useMdxStyle } from './use-mdx-style'

function cn(...inputs: (string | undefined | false | null)[]) {
  return clsx(inputs)
}

function MdxAnchor({ className, href, rel, target, ...props }: React.ComponentProps<'a'>) {
  const external = isExternalMdxHref(href)
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content -- MDX passes accessible anchor children through props.
    <a
      className={cn(useMdxStyle(mdxStyles.content.link, className), className)}
      href={href}
      rel={external ? (rel ?? 'noopener noreferrer') : rel}
      target={external ? (target ?? '_blank') : target}
      {...props}
    />
  )
}

function getCodeContent(element: React.ReactNode): string {
  if (typeof element === 'string') return element
  if (element && typeof element === 'object' && 'props' in element) {
    const el = element as { props: { children?: React.ReactNode } }
    if (el.props?.children) {
      if (Array.isArray(el.props.children)) return el.props.children.map(getCodeContent).join('')
      return getCodeContent(el.props.children)
    }
  }
  return ''
}

function getCodeLanguage(element: React.ReactNode): string | undefined {
  if (!(element && typeof element === 'object' && 'props' in element)) {
    return undefined
  }

  const el = element as {
    props: {
      children?: React.ReactNode
      className?: string
      'data-language'?: string
    }
  }
  const classLanguage = el.props.className?.match(/language-([^\s]+)/)?.[1]

  if (classLanguage) {
    return classLanguage
  }

  if (el.props['data-language']) {
    return el.props['data-language']
  }

  if (el.props.children) {
    return getCodeLanguage(el.props.children)
  }

  return undefined
}

function getNumericImageDimension(value: React.ImgHTMLAttributes<HTMLImageElement>['width']) {
  if (typeof value === 'number') {
    return value > 0 ? value : undefined
  }

  const parsed = Number.parseInt(value ?? '', 10)
  return parsed > 0 ? parsed : undefined
}

function MdxImage({
  className,
  alt = '',
  src,
  height,
  width,
  loading = 'lazy',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const initialWidth = getNumericImageDimension(width)
  const initialHeight = getNumericImageDimension(height)
  const [dimensions, setDimensions] = useState(() =>
    initialWidth && initialHeight
      ? { width: initialWidth, height: initialHeight }
      : getImageDimensions()
  )

  useEffect(() => {
    if (!src) {
      return
    }

    let cancelled = false

    const loadDimensions = async () => {
      const next = await getRealImageDimensions(src)
      if (!cancelled && next.width > 0 && next.height > 0) {
        setDimensions(next)
      }
    }

    // getRealImageDimensions() catches its own failures and falls back to the
    // default ratio, so this promise can never reject.
    void loadDimensions()

    return () => {
      cancelled = true
    }
  }, [src])

  const image = (
    <img
      alt={alt}
      className="mt-0 w-full rounded-xl"
      decoding="async"
      height={height}
      loading={loading}
      src={src}
      width={width}
      {...props}
    />
  )
  const triggerClassName = cn(useMdxStyle(mdxStyles.content.img, className), className)

  if (!src || !alt.trim()) {
    return image
  }

  return (
    <FigureLightboxTrigger
      alt={alt}
      className={triggerClassName}
      galleryId={MDX_FIGURE_LIGHTBOX_GALLERY_ID}
      height={dimensions.height}
      src={src}
      width={dimensions.width}
    >
      {image}
    </FigureLightboxTrigger>
  )
}

/**
 * Builds a styled passthrough for an intrinsic tag.
 *
 * Every one of these entries is a real React component (MDX renders the map
 * values as components), but naming them after their HTML tag hides that from
 * `react-hooks`' PascalCase heuristic. Producing them from a factory keeps the
 * hook call inside a properly-named component function.
 */
function createStyledTag<P extends { className?: string }>(
  tag: keyof React.JSX.IntrinsicElements,
  style: string
) {
  return function MdxStyledTag({ className, ...props }: P) {
    const styleClassName = useMdxStyle(style, className)
    return createElement(tag, { ...props, className: cn(styleClassName, className) })
  }
}

function MdxParagraph({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const insideExample = useIsInsideExample()
  if (insideExample) return <>{props.children}</>
  return (
    <p
      className={cn(getMdxStyle(mdxStyles.text.paragraph, className, insideExample), className)}
      {...props}
    />
  )
}

function MdxCode({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const insideExample = useIsInsideExample()
  const isInline = !className?.includes('language-')
  if (isInline) {
    return (
      <code
        className={cn(
          !(insideExample || hasSkipClass(className)) ? mdxStyles.content.inlineCode : '',
          className
        )}
        {...props}
      />
    )
  }
  return <code className={cn(mdxStyles.content.code, className)} {...props} />
}

export const mdxComponents = {
  h1: createStyledTag<React.HTMLAttributes<HTMLHeadingElement>>('h1', mdxStyles.headings.h1),
  h2: createStyledTag<React.HTMLAttributes<HTMLHeadingElement>>('h2', mdxStyles.headings.h2),
  h3: createStyledTag<React.HTMLAttributes<HTMLHeadingElement>>('h3', mdxStyles.headings.h3),
  h4: createStyledTag<React.HTMLAttributes<HTMLHeadingElement>>('h4', mdxStyles.headings.h4),
  h5: createStyledTag<React.HTMLAttributes<HTMLHeadingElement>>('h5', mdxStyles.headings.h5),
  h6: createStyledTag<React.HTMLAttributes<HTMLHeadingElement>>('h6', mdxStyles.headings.h6),

  p: MdxParagraph,

  blockquote: createStyledTag<React.HTMLAttributes<HTMLElement>>(
    'blockquote',
    mdxStyles.content.blockquote
  ),

  code: MdxCode,

  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    const language = getCodeLanguage(props.children)
    const code = getCodeContent(props.children).trim()
    const preProps = props as React.HTMLAttributes<HTMLPreElement> & { 'data-theme'?: string }
    const isHighlighted = Boolean(preProps['data-theme']) || className?.includes('shiki')

    if (language === 'mermaid') {
      return <MermaidDiagram chart={code} />
    }

    if (isHighlighted) {
      return (
        <CodeBlock code={code} lang={language}>
          <pre className={cn('code-block-pre !p-0', className)} {...props} />
        </CodeBlock>
      )
    }

    return <CodeBlock code={code} lang={language} />
  },

  ul: createStyledTag<React.HTMLAttributes<HTMLUListElement>>('ul', mdxStyles.content.ul),
  ol: createStyledTag<React.HTMLAttributes<HTMLOListElement>>('ol', mdxStyles.content.ol),
  li: createStyledTag<React.HTMLAttributes<HTMLLIElement>>('li', mdxStyles.content.li),

  a: MdxAnchor,

  strong: createStyledTag<React.HTMLAttributes<HTMLElement>>('strong', mdxStyles.content.strong),
  em: createStyledTag<React.HTMLAttributes<HTMLElement>>('em', mdxStyles.content.em),
  kbd: createStyledTag<React.HTMLAttributes<HTMLElement>>('kbd', mdxStyles.content.kbd),
  hr: createStyledTag<React.HTMLAttributes<HTMLHRElement>>('hr', mdxStyles.content.hr),

  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className={mdxStyles.content.tableWrapper}>
      <Table className={cn(mdxStyles.content.table, className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <TableHeader className={cn(mdxStyles.content.thead, className)} {...props} />
  ),
  tbody: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <TableBody className={cn(mdxStyles.content.tbody, className)} {...props} />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <TableRow className={cn(mdxStyles.content.tr, className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <TableHead className={cn(mdxStyles.content.th, className)} {...props} />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <TableCell className={cn(mdxStyles.content.td, className)} {...props} />
  ),
  caption: ({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) => (
    <TableCaption className={cn(mdxStyles.content.caption, className)} {...props} />
  ),

  img: MdxImage,

  details: createStyledTag<React.HTMLAttributes<HTMLElement>>('details', mdxStyles.content.details),
  summary: createStyledTag<React.HTMLAttributes<HTMLElement>>('summary', mdxStyles.content.summary),

  mark: createStyledTag<React.HTMLAttributes<HTMLElement>>('mark', mdxStyles.content.mark),
  del: createStyledTag<React.HTMLAttributes<HTMLElement>>('del', mdxStyles.content.del),
  ins: createStyledTag<React.HTMLAttributes<HTMLElement>>('ins', mdxStyles.content.ins),
  sub: createStyledTag<React.HTMLAttributes<HTMLElement>>('sub', mdxStyles.content.sub),
  sup: createStyledTag<React.HTMLAttributes<HTMLElement>>('sup', mdxStyles.content.sup),
  abbr: createStyledTag<React.HTMLAttributes<HTMLElement>>('abbr', mdxStyles.content.abbr),
  cite: createStyledTag<React.HTMLAttributes<HTMLElement>>('cite', mdxStyles.content.cite),
  dfn: createStyledTag<React.HTMLAttributes<HTMLElement>>('dfn', mdxStyles.content.dfn),
  time: createStyledTag<React.HTMLAttributes<HTMLElement>>('time', mdxStyles.content.time),
  var: createStyledTag<React.HTMLAttributes<HTMLElement>>('var', mdxStyles.content.var),
  samp: createStyledTag<React.HTMLAttributes<HTMLElement>>('samp', mdxStyles.content.samp),
  output: createStyledTag<React.HTMLAttributes<HTMLElement>>('output', mdxStyles.content.output),

  iframe: createStyledTag<React.IframeHTMLAttributes<HTMLIFrameElement>>(
    'iframe',
    mdxStyles.content.iframe
  ),
  video: createStyledTag<React.VideoHTMLAttributes<HTMLVideoElement>>(
    'video',
    mdxStyles.content.video
  ),
  audio: createStyledTag<React.AudioHTMLAttributes<HTMLAudioElement>>(
    'audio',
    mdxStyles.content.audio
  ),

  ...blockMdxComponents,
}
