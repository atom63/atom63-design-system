import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardLabel,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'

import { formatDate, posts } from '../content/posts'

export function BlogIndexPage() {
  return (
    <Page>
      <Container maxWidth="narrow">
        <Section removeTopSpacing>
          <SectionHeader description="Notes, guides and updates." level={1} title="Blog" />
          {posts.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No posts yet</EmptyTitle>
                <EmptyDescription>
                  Add an .mdx file to src/content/blog to publish one.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="grid gap-4">
              {posts.map(post => (
                <li key={post.slug}>
                  <Card>
                    <CardHeader>
                      <CardLabel className="text-muted-foreground">
                        {formatDate(post.date)}
                      </CardLabel>
                    </CardHeader>
                    <CardContent>
                      <CardTitle>
                        <Link params={{ slug: post.slug }} to="/blog/$slug">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>{post.description}</CardDescription>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Container>
    </Page>
  )
}
