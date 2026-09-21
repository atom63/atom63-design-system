import type { Meta, StoryObj } from '@storybook/react-vite'
import { Container, GridChrome, GridGuides, GridRule, Page, Section, SectionHeader } from '../index'

const WIDTHS = [
  'fluid',
  'widest',
  'wider',
  'wide',
  'default',
  'narrow',
  'narrower',
  'narrowest',
] as const

const meta = {
  title: 'UI React/Grid Chrome',
  component: GridChrome,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    maxWidth: {
      control: 'select',
      options: WIDTHS,
    },
    fixedRails: { control: 'boolean' },
    crosshairs: { control: 'boolean' },
    lineStyle: {
      control: 'inline-radio',
      options: ['dashed', 'solid'],
    },
    tone: {
      control: 'inline-radio',
      options: ['subtle', 'default', 'strong'],
    },
  },
  args: {
    maxWidth: 'wide',
    fixedRails: true,
    crosshairs: true,
    lineStyle: 'dashed',
    tone: 'default',
  },
} satisfies Meta<typeof GridChrome>

export default meta

type Story = StoryObj<typeof meta>

function DemoBlock({ label }: { label: string }) {
  return (
    <div className="border-border/40 bg-card/40 rounded-md border px-4 py-6">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Hairline rails and crossbars frame the content column.
      </p>
    </div>
  )
}

export const Playground: Story = {
  render: args => (
    <GridChrome {...args} className="bg-background min-h-dvh">
      <Container chrome="grid" maxWidth={args.maxWidth} padding="x">
        <Section spacing="tight">
          <SectionHeader
            description="Fixed viewport rails plus in-flow container chrome."
            title="Grid chrome"
            variant="secondary"
          />
          <DemoBlock label="Hero / intro" />
        </Section>
        <GridRule />
        <Section spacing="tight">
          <DemoBlock label="Section after rule" />
        </Section>
      </Container>
    </GridChrome>
  ),
}

export const ContainerRailsOnly: Story = {
  name: 'Container chrome=grid',
  render: () => (
    <Page className="bg-background min-h-dvh py-10">
      <Container chrome="grid" maxWidth="wide" padding="x">
        <DemoBlock label="In-flow border-x rails (no fixed overlay)" />
        <DemoBlock label="Second block" />
      </Container>
    </Page>
  ),
}

export const RulesAndCrosshairs: Story = {
  render: () => (
    <GridChrome className="bg-background min-h-dvh" maxWidth="wide">
      <Container chrome="grid" maxWidth="wide" padding="x">
        <Section spacing="tight">
          <SectionHeader title="First band" variant="secondary" />
          <DemoBlock label="Above the rule" />
        </Section>
        <GridRule />
        <Section spacing="tight">
          <SectionHeader title="Second band" variant="secondary" />
          <DemoBlock label="Below the rule" />
        </Section>
        <GridRule bleed />
        <Section spacing="tight">
          <DemoBlock label="After bleed rule (line full-bleed, ticks on rails)" />
        </Section>
      </Container>
    </GridChrome>
  ),
}

export const NestedGuides: Story = {
  render: () => (
    <GridChrome className="bg-background min-h-dvh" maxWidth="wide">
      <div className="relative">
        <GridGuides columns={3} />
        <Container chrome="grid" maxWidth="wide" padding="x">
          <Section spacing="tight">
            <SectionHeader
              description="Inner vertical guides (md+) for denser compositions."
              title="Nested column guides"
              variant="secondary"
            />
            <div className="grid gap-4 md:grid-cols-3">
              <DemoBlock label="Col 1" />
              <DemoBlock label="Col 2" />
              <DemoBlock label="Col 3" />
            </div>
          </Section>
          <GridRule />
          <Section spacing="tight">
            <DemoBlock label="Guides continue behind content" />
          </Section>
        </Container>
      </div>
    </GridChrome>
  ),
}
