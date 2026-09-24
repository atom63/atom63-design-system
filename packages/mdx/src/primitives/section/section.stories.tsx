import { Section } from '@atom63/mdx/primitives'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

function Panel({ label }: { label: string }) {
  return (
    <div className="border-border text-secondary-foreground rounded-lg border p-4 text-sm">
      {label}
    </div>
  )
}

const meta = {
  title: 'MDX/Primitives/Section',
  tags: ['!autodocs'],
  component: Section,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    width: {
      control: 'select',
      options: ['column', 'wide', 'bleed'],
    },
  },
  args: {
    width: 'column',
    children: <Panel label="Section content" />,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '72rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Section>

export default meta

type Story = StoryObj<typeof meta>

export const Column: Story = {
  args: {
    width: 'column',
    children: <Panel label="column — constrained to the reading measure (~42rem)" />,
  },
}

export const Wide: Story = {
  args: {
    width: 'wide',
    children: <Panel label="wide — widened measure (~72rem) for tables and media" />,
  },
}

export const Bleed: Story = {
  args: {
    width: 'bleed',
    children: <Panel label="bleed — no max width, fills the container" />,
  },
}

export const AllWidths: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Section width="column">
        <Panel label="column" />
      </Section>
      <Section width="wide">
        <Panel label="wide" />
      </Section>
      <Section width="bleed">
        <Panel label="bleed" />
      </Section>
    </div>
  ),
}
