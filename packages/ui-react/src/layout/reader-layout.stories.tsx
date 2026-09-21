import { Container, Page, ReaderLayout, Section } from '@atom63/ui-react/layout'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/ReaderLayout',
  component: ReaderLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ReaderLayout>

export default meta

type Story = StoryObj<typeof meta>

const sectionLinks = ['Overview', 'Tokens', 'Components', 'Patterns']

export const DocsWithRail: Story = {
  render: () => (
    <Page noPadding>
      <Container maxWidth="widest" padding="none">
        <Section gap={false} removeTopSpacing={false} spacing="tight">
          <ReaderLayout
            aside={
              <nav aria-label="Page navigation" className="sticky top-8 flex flex-col gap-2">
                {sectionLinks.map(link => (
                  <a
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    href={`#${link.toLowerCase()}`}
                    key={link}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">Foundation</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight">Reader layout</h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                A centered documentation column with a fixed-width contextual rail for page
                navigation or companion actions.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sectionLinks.slice(1).map(link => (
                <a
                  className="border-border bg-card hover:border-primary/50 focus-visible:ring-ring focus-visible:ring-offset-background block overflow-hidden rounded-sm border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  href={`#${link.toLowerCase()}`}
                  key={link}
                >
                  <div className="border-border bg-muted/30 border-b px-4 py-3">
                    <p className="text-foreground text-sm font-semibold">{link}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-muted-foreground text-sm leading-6">
                      Compact card content stays aligned to the reader column.
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </ReaderLayout>
        </Section>
      </Container>
    </Page>
  ),
}

/** A page with no rail keeps the same measure when it reserves the column. */
export const ReservedRail: Story = {
  render: () => (
    <Page noPadding>
      <Container maxWidth="widest" padding="none">
        <Section gap={false} removeTopSpacing={false} spacing="tight">
          <ReaderLayout reserveAside>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight">No rail on this page</h1>
              <p className="text-muted-foreground leading-relaxed">
                The content column is the width it would be next to a rail, so moving between a page
                that has one and a page that does not never shifts the measure.
              </p>
            </div>
          </ReaderLayout>
        </Section>
      </Container>
    </Page>
  ),
}
