import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLabel,
  CardTitle,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
} from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'

import { formatDate, posts } from '../content/posts'
import { site } from '../site'

const features = [
  {
    title: 'One token architecture',
    body: 'Colors, space, radius and motion come from --a63-* tokens, so every theme and mode follows.',
  },
  {
    title: 'Components with contracts',
    body: 'Sizes, variants and states are defined once and shared by React, SwiftUI and Figma.',
  },
  {
    title: 'Content in MDX',
    body: 'Write posts in Markdown with design system blocks, rendered with the same typography.',
  },
]

export function HomePage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function subscribe(event: FormEvent) {
    event.preventDefault()
    // Connect this to your newsletter or form service.
    setSubscribed(true)
  }

  return (
    <Page>
      <Container>
        <Section removeTopSpacing spacing="generous">
          <Badge variant="outline">New site</Badge>
          <SectionHeader
            description={site.description}
            level={1}
            title={site.tagline}
            variant="display"
          />
          <div className="flex flex-wrap gap-3">
            <Button render={<Link to="/blog" />}>Read the blog</Button>
            <Button
              render={<a href="https://system.atom63.io" rel="noreferrer" target="_blank" />}
              variant="outline"
            >
              Design system docs
            </Button>
          </div>
        </Section>

        <Section>
          <SectionHeader title="What is included" />
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(feature => (
              <Card key={feature.title}>
                <CardContent>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.body}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section>
          <SectionHeader title="Latest posts" />
          <ul className="grid gap-4 md:grid-cols-2">
            {posts.slice(0, 2).map(post => (
              <li key={post.slug}>
                <Card>
                  <CardHeader>
                    <CardLabel className="text-muted-foreground">{formatDate(post.date)}</CardLabel>
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
        </Section>

        <Section>
          <Card className="max-w-xl">
            <form onSubmit={subscribe}>
              <CardContent>
                <CardTitle>Stay in the loop</CardTitle>
                <CardDescription>
                  Get new posts by email. No spam, unsubscribe any time.
                </CardDescription>
                <Field className="mt-4">
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <Input
                    autoComplete="email"
                    id="email"
                    onChange={event => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                  <FieldDescription>
                    {subscribed
                      ? `Thanks, ${email} is on the list.`
                      : 'We send at most one email a month.'}
                  </FieldDescription>
                </Field>
              </CardContent>
              <CardFooter>
                <Button disabled={subscribed} type="submit">
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </Section>
      </Container>
    </Page>
  )
}
