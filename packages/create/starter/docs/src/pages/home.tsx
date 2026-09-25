import { Card, CardContent, CardDescription, CardTitle } from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'

import { groups } from '../content/docs'
import { site } from '../site'

export function HomePage() {
  return (
    <Page>
      <Container>
        <Section removeTopSpacing>
          <SectionHeader description={site.description} level={1} title={site.tagline} />
        </Section>
        {groups.map(group => (
          <Section key={group.name}>
            <SectionHeader level={2} title={group.name} variant="secondary" />
            <ul className="grid gap-4 md:grid-cols-2">
              {group.docs.map(doc => (
                <li key={doc.slug}>
                  <Card>
                    <CardContent>
                      <CardTitle>
                        <Link params={{ slug: doc.slug }} to="/docs/$slug">
                          {doc.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </Section>
        ))}
      </Container>
    </Page>
  )
}
