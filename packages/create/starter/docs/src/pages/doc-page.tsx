import { DocsMDXContentProvider } from '@atom63/mdx'
import { createMdxComponents } from '@atom63/mdx/article'
import { PageMeta, PageTableOfContents } from '@atom63/mdx/blocks'
import { Button } from '@atom63/ui-react'
import { Page, ReaderLayout } from '@atom63/ui-react/layout'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { findDoc, neighbours } from '../content/docs'
import { NotFoundPage } from './not-found'

// Core prose plus the @atom63/mdx blocks (Callout, Steps, Tabs, …) for every page.
const components = createMdxComponents()

export function DocPage() {
  const { slug } = useParams({ from: '/docs/$slug' })
  const doc = findDoc(slug)
  if (!doc) {
    return <NotFoundPage />
  }
  const { Content } = doc
  const { next, previous } = neighbours(slug)

  return (
    // Page renders <main>, where the table of contents looks for headings.
    <Page noPadding>
      <ReaderLayout aside={<PageTableOfContents label="On this page" />}>
        <DocsMDXContentProvider components={components}>
          <PageMeta description={doc.description} eyebrow={doc.group} title={doc.title} />
          <Content />
        </DocsMDXContentProvider>
        <nav aria-label="Pages" className="flex flex-wrap justify-between gap-3 pt-8">
          {previous ? (
            <Button
              render={<Link params={{ slug: previous.slug }} to="/docs/$slug" />}
              variant="outline"
            >
              <ArrowLeft aria-hidden />
              {previous.title}
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button
              render={<Link params={{ slug: next.slug }} to="/docs/$slug" />}
              variant="outline"
            >
              {next.title}
              <ArrowRight aria-hidden />
            </Button>
          ) : null}
        </nav>
      </ReaderLayout>
    </Page>
  )
}
