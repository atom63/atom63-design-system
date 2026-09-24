import { Container, Page, ReaderLayout, Section } from '@atom63/ui-react/layout'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/ReaderLayout',
  component: ReaderLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ReaderLayout>

export default meta

// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

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
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
              <span className="text-sm font-medium text-muted-foreground">Foundation</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight">Reader layout</h1>
              <p className="max-w-2xl leading-relaxed text-muted-foreground">
                A centered documentation column with a fixed-width contextual rail for page
                navigation or companion actions.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sectionLinks.slice(1).map(link => (
                <a
                  className="block overflow-hidden rounded-sm border border-border bg-card transition-colors outline-none hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href={`#${link.toLowerCase()}`}
                  key={link}
                >
                  <div className="border-b border-border bg-muted/30 px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{link}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm leading-6 text-muted-foreground">
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
              <p className="leading-relaxed text-muted-foreground">
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

/* DocsWithRail in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...DocsWithRail, globals: { mode: 'dark' } }
