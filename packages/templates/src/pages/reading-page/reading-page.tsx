import { Separator } from '@atom63/ui-react'
import { Container, Page, ReaderLayout, Section } from '@atom63/ui-react/layout'

export const template = {
  id: 'reading-page',
  kind: 'page',
  title: 'Reading page',
  description:
    'A long-form reading page for an article, a blog post or a docs page, built on ReaderLayout from @atom63/ui-react/layout: Page owns the main landmark, Container the width, Section the space around the document, and ReaderLayout a centred reading column with a table-of-contents rail beside it on wide screens. reserveAside keeps the column the same width on pages with no rail. Inside an app shell, give Page render={<div />} so the document keeps one main landmark.',
  category: 'layout',
  tags: [
    'reading',
    'reader',
    'article',
    'blog',
    'blog post',
    'post',
    'docs',
    'documentation',
    'guide',
    'long-form',
    'essay',
    'table of contents',
    'rail',
    'reader layout',
    'prose',
  ],
  readiness: 'draft',
} as const

export interface ReadingSection {
  body: readonly string[]
  id: string
  title: string
}

const sampleSections: readonly ReadingSection[] = [
  {
    body: [
      'An invoice is a request to be paid. It names who owes what, for which work, and by when. Tally keeps every invoice you send in one list, with its status beside it, so you can see at a glance what is still open.',
      'This guide walks through the life of one invoice, from the draft to the day it is paid.',
    ],
    id: 'overview',
    title: 'Overview',
  },
  {
    body: [
      'Start from a customer, add the lines you are billing for, and set a due date. A draft stays private until you send it, so you can come back to it as often as you need.',
      'Each line has a description, a quantity and a price. Tally adds the lines up and applies the tax rate you set for the customer.',
    ],
    id: 'drafting',
    title: 'Drafting an invoice',
  },
  {
    body: [
      'When you send an invoice, the customer gets an email with a link to pay it. The invoice moves from draft to open, and its due date starts to count down.',
      'If the due date passes before it is paid, the invoice is marked overdue and Tally sends one polite reminder.',
    ],
    id: 'sending',
    title: 'Sending and reminders',
  },
  {
    body: [
      'A payment through the link marks the invoice as paid on its own. A payment that arrives another way, such as a bank transfer, you mark as paid yourself from the invoice.',
    ],
    id: 'getting-paid',
    title: 'Getting paid',
  },
]

export interface ReadingPageProps {
  /** The article's sections; each one gets a heading and a link in the rail. */
  sections?: readonly ReadingSection[]
}

/* A sample reading page: a guide with a table-of-contents rail. */
export function ReadingPage({ sections = sampleSections }: ReadingPageProps) {
  return (
    <Page noPadding>
      <Container maxWidth="widest" padding="none">
        <Section gap={false} removeTopSpacing={false} spacing="tight">
          <ReaderLayout
            aside={
              <nav aria-label="On this page" className="sticky top-8 flex flex-col gap-3">
                <p className="text-foreground text-sm font-semibold">On this page</p>
                <ul className="flex flex-col gap-2">
                  {sections.map(section => (
                    <li key={section.id}>
                      <a
                        className="text-muted-foreground hover:text-foreground focus-visible:outline-ring text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                        href={`#${section.id}`}
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            }
          >
            <header className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm font-medium">Guides</p>
              <h1 className="font-heading text-foreground text-4xl font-semibold tracking-tight">
                How invoicing works
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
                From the first draft to the day it is paid: what happens to an invoice, and what you
                can do at each step.
              </p>
              <p className="text-muted-foreground text-sm">
                Updated 12 September 2026 · 4 min read
              </p>
            </header>
            <Separator />
            {sections.map(section => (
              <section className="flex flex-col gap-4" key={section.id}>
                <h2
                  className="font-heading text-foreground scroll-mt-8 text-2xl font-semibold"
                  id={section.id}
                >
                  {section.title}
                </h2>
                {section.body.map(paragraph => (
                  <p className="text-foreground max-w-2xl leading-relaxed" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </ReaderLayout>
        </Section>
      </Container>
    </Page>
  )
}
