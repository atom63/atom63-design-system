import { CopyButton, ScrollArea } from '@atom63/ui-react'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { useContext } from 'react'
import { TechnicalFrame } from '../../foundations/frame/framed-block'
import { normalizeCodeLanguage, useShikiHighlightResult } from '../../lib/use-shiki-highlight'
import { mdxStyles } from '../../mdx-styles'
import { type CodeBlockVariant, CodeBlockVariantContext } from '../code-block-variant-context'

export type CodeBlockProps = {
  children?: ReactNode
  className?: string
  code: string
  copyLabel?: string
  /** Label shown in place of an unknown language in the article header. */
  fallbackLangLabel?: string
  lang?: string
  /** Visually-hidden status text announced while syntax highlighting runs. */
  loadingLabel?: string
  maxHeight?: string
  /**
   * Show a numbered gutter. Defaults to a smart heuristic: on for `article`
   * blocks longer than 6 lines, off for short snippets and embedded blocks.
   */
  showLineNumbers?: boolean
  showCopyButton?: boolean
  spacing?: 'component' | 'none'
  variant?: CodeBlockVariant
}

/** Line count above which the smart default turns line numbers on. */
const LINE_NUMBER_THRESHOLD = 6

function CodeFallback({ code, lang }: { code: string; lang?: string }) {
  return (
    <pre className="code-block-pre m-0 overflow-visible border-0 bg-transparent p-0 font-mono text-sm leading-relaxed">
      <code className={clsx('border-0 bg-transparent p-0 shadow-none', lang && `language-${lang}`)}>
        {code.trim()}
      </code>
    </pre>
  )
}

function CodeBlockSurface({
  children,
  className,
  code,
  copyLabel = 'Copy code',
  fallbackLangLabel = 'code',
  lang,
  maxHeight = 'max-h-[min(32rem,70vh)]',
  showLineNumbers = false,
  showCopyButton = true,
  spacing,
  variant = 'article',
}: CodeBlockProps) {
  const displayLanguage = lang?.replace(/^language-/, '').trim()
  const resolvedSpacing = spacing ?? (variant === 'embedded' ? 'none' : 'component')

  if (variant === 'embedded') {
    return (
      <div
        className={clsx(
          'code-block code-block-embedded not-mdx mdx-block group/code relative min-w-0',
          resolvedSpacing === 'component' && mdxStyles.spacing.component,
          className
        )}
        data-numbered={showLineNumbers || undefined}
      >
        <ScrollArea
          className="code-block-body h-auto min-w-0"
          showScrollbarOnHover
          viewportClassName={clsx(
            'code-block-viewport',
            maxHeight,
            '[&_pre]:m-0 [&_pre]:overflow-visible [&_pre]:border-0 [&_pre]:bg-transparent [&_pre]:p-0',
            '[&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed',
            '[&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:shadow-none',
            '[&_.line]:min-h-[1.45em]',
            '[&_.shiki]:bg-transparent [&_.shiki]:text-[var(--shiki-light)] [&_.shiki_span]:text-[var(--shiki-light)]',
            'dark:[&_.shiki]:text-[var(--shiki-dark)] dark:[&_.shiki_span]:text-[var(--shiki-dark)]'
          )}
        >
          {children}
        </ScrollArea>
        {showCopyButton ? (
          <CopyButton
            className="code-block-copy absolute top-0 right-0 size-11 shrink-0 opacity-0 transition-opacity group-hover/code:opacity-100 focus-visible:opacity-100 md:size-7"
            label={copyLabel}
            size="icon-sm"
            value={code.trim()}
            variant="ghost"
          />
        ) : null}
      </div>
    )
  }

  return (
    <TechnicalFrame
      className={clsx(
        'code-block mdx-code-block not-mdx mdx-block group/code min-w-0',
        resolvedSpacing === 'component' && mdxStyles.spacing.component,
        className
      )}
      dataNumbered={showLineNumbers}
      headerEnd={
        showCopyButton ? (
          <CopyButton
            className="size-11 shrink-0 md:size-7"
            label={copyLabel}
            size="icon-sm"
            value={code.trim()}
            variant="ghost"
          />
        ) : null
      }
      headerStart={
        <span className="mdx-code-block-lang truncate font-mono text-xs">
          {displayLanguage || fallbackLangLabel}
        </span>
      }
      panelClassName="mdx-code-block-panel code-block-body min-w-0 overflow-hidden p-0"
      width="wide"
    >
      <ScrollArea className={maxHeight} showScrollbarOnHover>
        <div
          className={clsx(
            'px-4 py-3.5',
            '[&_pre]:m-0 [&_pre]:overflow-visible [&_pre]:border-0 [&_pre]:bg-transparent [&_pre]:p-0',
            '[&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-relaxed',
            '[&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:shadow-none',
            '[&_.line]:min-h-[1.5em]',
            '[&_.shiki]:bg-transparent [&_.shiki]:text-[var(--shiki-light)] [&_.shiki_span]:text-[var(--shiki-light)]',
            'dark:[&_.shiki]:text-[var(--shiki-dark)] dark:[&_.shiki_span]:text-[var(--shiki-dark)]'
          )}
        >
          {children}
        </div>
      </ScrollArea>
    </TechnicalFrame>
  )
}

export function CodeBlock({
  children,
  code,
  lang = 'tsx',
  loadingLabel = 'Highlighting code',
  showLineNumbers,
  variant,
  ...props
}: CodeBlockProps) {
  const contextualVariant = useContext(CodeBlockVariantContext)
  const resolvedVariant = variant ?? contextualVariant ?? 'article'
  const normalizedLanguage = normalizeCodeLanguage(lang)
  const { html, isLoading } = useShikiHighlightResult(code, lang)

  // Smart default: number substantial article blocks, leave short snippets clean.
  const resolvedLineNumbers =
    showLineNumbers ??
    (resolvedVariant === 'article' && code.trim().split('\n').length > LINE_NUMBER_THRESHOLD)

  if (children) {
    return (
      <CodeBlockSurface
        code={code}
        lang={normalizedLanguage ?? lang}
        showLineNumbers={resolvedLineNumbers}
        variant={resolvedVariant}
        {...props}
      >
        {children}
      </CodeBlockSurface>
    )
  }

  return (
    <CodeBlockSurface
      code={code}
      lang={normalizedLanguage ?? lang}
      showLineNumbers={resolvedLineNumbers}
      variant={resolvedVariant}
      {...props}
    >
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <CodeFallback code={code} lang={normalizedLanguage} />
      )}
      {isLoading ? <span className="sr-only">{loadingLabel}</span> : null}
    </CodeBlockSurface>
  )
}
