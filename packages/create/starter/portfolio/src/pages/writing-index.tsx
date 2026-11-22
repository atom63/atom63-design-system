import {
  Card,
  CardContent,
  CardDescription,
  CardLabel,
  CardTitle,
  cardLinkClassName,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'

import { formatDate, posts } from '../content/writing'

export function WritingIndexPage() {
  return (
    <Page>
      <Container maxWidth="narrow">
        <Section removeTopSpacing>
          <SectionHeader
            description="Notes on design, systems and the work in between."
            level={1}
            title="Writing"
          />
          {posts.length === 0 ? (
            <Empty className="mt-8">
              <EmptyHeader>
                <EmptyTitle>No posts yet</EmptyTitle>
                <EmptyDescription>
                  Add an .mdx file to src/content/writing to publish one.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="mt-8 grid gap-4">
              {posts.map(post => (
                <li key={post.slug}>
                  <Link
                    className={cardLinkClassName}
                    params={{ slug: post.slug }}
                    to="/writing/$slug"
                  >
                    <Card variant="interactive">
                      <CardContent>
                        <CardLabel className="text-muted-foreground">
                          {formatDate(post.date)}
                        </CardLabel>
                        <CardTitle>{post.title}</CardTitle>
                        <CardDescription>{post.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Container>
    </Page>
  )
}
