import { ArticleMDXContentProvider, createMdxComponents } from '@atom63/mdx/article'
import { PageMeta } from '@atom63/mdx/blocks'
import { Button } from '@atom63/ui-react'
import { Container, Page } from '@atom63/ui-react/layout'
import { Link, useParams } from '@tanstack/react-router'

import { findPost, formatDate } from '../content/posts'
import { NotFoundPage } from './not-found'

// Core prose plus the @atom63/mdx blocks (Callout, Steps, Tabs, …) for every post.
const components = createMdxComponents()

export function BlogPostPage() {
  const { slug } = useParams({ from: '/blog/$slug' })
  const post = findPost(slug)
  if (!post) {
    return <NotFoundPage />
  }
  const { Content } = post

  return (
    <Page>
      <Container maxWidth="narrow">
        <article>
          <ArticleMDXContentProvider components={components}>
            {/* PageMeta follows the provider's reading column, like the post body. */}
            <PageMeta
              description={post.description}
              eyebrow={<time dateTime={post.date}>{formatDate(post.date)}</time>}
              title={post.title}
            />
            <Content />
          </ArticleMDXContentProvider>
        </article>
        <div className="mx-auto mt-12 w-full max-w-xl">
          <Button render={<Link to="/blog" />} variant="outline">
            All posts
          </Button>
        </div>
      </Container>
    </Page>
  )
}
