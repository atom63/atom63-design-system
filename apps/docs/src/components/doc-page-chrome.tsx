import {
  Button,
  ButtonGroup,
  ConnectedPanel,
  ConnectedPanelBody,
  ConnectedPanelContent,
  ConnectedPanelTrigger,
  CopyButtonFeedback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from '@atom63/ui-react'
import { PageTableOfContents } from '../mdx-kit/blocks'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, FileText, ListTree } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DocAreaId, DocNavigation } from '../lib/doc-pages'
import { DOC_AREA_LABELS } from '../lib/doc-pages'
import { pathForDoc } from '../lib/doc-routing'
import { loadDocSource } from '../lib/doc-source'
import { docNavSurface } from '../lib/doc-surfaces'

export const DOC_TOC_HEADING_SELECTOR = '[data-mdx-content] h2, article h2'

export function DocBreadcrumb({
  area,
  navigation,
}: {
  area: DocAreaId
  navigation: DocNavigation
}) {
  const sectionTitle = navigation.current?.sectionTitle

  return (
    <nav aria-label="Breadcrumb" className="docs-page-breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            className="rounded-sm transition-colors hover:text-foreground"
            to={pathForDoc(area)}
          >
            {DOC_AREA_LABELS[area]}
          </Link>
        </li>
        {sectionTitle && sectionTitle !== DOC_AREA_LABELS[area] ? (
          <>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">{sectionTitle}</li>
          </>
        ) : null}
      </ol>
    </nav>
  )
}

export function DocPageFooterNav({ navigation }: { navigation: DocNavigation }) {
  const { next, previous } = navigation

  if (!next && !previous) {
    return null
  }

  return (
    <nav aria-label="Page navigation" className="mt-16 grid gap-3 border-t pt-8 sm:grid-cols-2">
      {previous ? (
        <FooterNavLink direction="previous" entry={previous} />
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? <FooterNavLink direction="next" entry={next} /> : null}
    </nav>
  )
}

function FooterNavLink({
  direction,
  entry,
}: {
  direction: 'next' | 'previous'
  entry: NonNullable<DocNavigation['next']>
}) {
  const isNext = direction === 'next'

  return (
    <Link
      className={`group flex flex-col gap-1 rounded-lg border p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${docNavSurface} ${
        isNext ? 'sm:col-start-2 sm:items-end sm:text-right' : ''
      }`}
      to={pathForDoc(entry.area, entry.slug)}
    >
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {isNext ? null : <ArrowLeft aria-hidden="true" className="size-3.5" />}
        {isNext ? 'Next' : 'Previous'}
        {isNext ? <ArrowRight aria-hidden="true" className="size-3.5" /> : null}
      </span>
      <span className="text-sm font-medium text-foreground">{entry.label}</span>
    </Link>
  )
}

export function DocPageActions({ markdownPath, slug }: { markdownPath: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)
  const [activeSectionLabel, setActiveSectionLabel] = useState('On this page')
  const [tocOpen, setTocOpen] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }
    },
    []
  )

  useEffect(() => {
    setActiveSectionLabel('On this page')
  }, [slug])

  const copyPage = useCallback(async () => {
    setCopying(true)

    try {
      const source = await loadDocSource(slug)

      if (!source) {
        toast.error('Could not load this page source')
        return
      }

      await navigator.clipboard.writeText(source)
      setCopied(true)
      toast.success('Page copied as Markdown')
      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    } finally {
      setCopying(false)
    }
  }, [slug])

  const pageActionsMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Page actions"
            className="px-2"
            size="sm"
            type="button"
            variant="outline"
          />
        }
      >
        <ChevronDown aria-hidden className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem disabled={copying} onClick={() => void copyPage()}>
          {copied ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          {copied ? 'Copied' : 'Copy page'}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <a aria-label="View as Markdown" href={markdownPath} rel="noopener" target="_blank" />
          }
        >
          <FileText aria-hidden className="size-4" />
          View as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="docs-page-actions">
      <ButtonGroup className="docs-page-actions-default" size="sm">
        <Button
          aria-label={copied ? 'Page copied as Markdown' : 'Copy page as Markdown'}
          className="a63-CopyButton"
          data-copied={copied ? '' : undefined}
          disabled={copying}
          loading={copying}
          onClick={() => void copyPage()}
          size="sm"
          type="button"
          variant="outline"
        >
          <CopyButtonFeedback copied={copied}>Copy Page</CopyButtonFeedback>
        </Button>
        {pageActionsMenu}
      </ButtonGroup>
      <div className="docs-page-actions-tablet">
        <ConnectedPanel
          align="end"
          className="docs-page-toc-panel"
          collapsedWidth={176}
          expandedWidth={280}
          onOpenChange={setTocOpen}
          open={tocOpen}
          variant="button-group"
        >
          <ButtonGroup aria-label="Page navigation and actions" size="sm">
            <ConnectedPanelTrigger
              aria-label={`Open table of contents, current section: ${activeSectionLabel}`}
              icon={<ListTree aria-hidden className="size-4" />}
              showChevron={false}
              summary={activeSectionLabel}
            />
            {pageActionsMenu}
          </ButtonGroup>
          <ConnectedPanelContent forceMount>
            <ConnectedPanelBody className="scrollbar-reveal max-h-72 overflow-y-auto overscroll-contain p-2">
              <PageTableOfContents
                containerSelector="[data-mdx-scroll-root]"
                headingSelector={DOC_TOC_HEADING_SELECTOR}
                label="On this page"
                onActiveLabelChange={setActiveSectionLabel}
                onNavigate={() => setTocOpen(false)}
                scrollOffset={96}
                showProgress={false}
                variant="embedded"
              />
            </ConnectedPanelBody>
          </ConnectedPanelContent>
        </ConnectedPanel>
      </div>
    </div>
  )
}
