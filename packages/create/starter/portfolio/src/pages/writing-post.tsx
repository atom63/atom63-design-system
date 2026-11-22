import { ArticleMDXContentProvider } from '@atom63/mdx/article'
import { PageMeta } from '@atom63/mdx/blocks'
import { Button } from '@atom63/ui-react'
import { Container, Page } from '@atom63/ui-react/layout'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { mdxComponents } from '../components/mdx-components'
import { findPost, formatDate } from '../content/writing'
import { NotFoundPage } from './not-found'

export function WritingPostPage() {
  const { slug } = useParams({ from: '/site/writing/$slug' })
  const post = findPost(slug)
  if (!post) {
    return <NotFoundPage />
  }
  const { Content } = post

  return (
    <Page>
      <Container maxWidth="narrower">
        <article>
          <ArticleMDXContentProvider components={mdxComponents} variant="article">
            {/* `article`: the header, prose, code and blocks share one column and one left edge. */}
            <PageMeta
              description={post.description}
              eyebrow={<time dateTime={post.date}>{formatDate(post.date)}</time>}
              title={post.title}
            />
            <Content />
          </ArticleMDXContentProvider>
        </article>
        <div className="mt-12">
          <Button render={<Link to="/writing" />} size="sm" tone="muted" variant="ghost">
            <ArrowLeft aria-hidden />
            All writing
          </Button>
        </div>
      </Container>
    </Page>
  )
}
