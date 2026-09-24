import { Grid } from '@atom63/mdx/primitives'
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
  title: 'MDX/Primitives/Grid',
  tags: ['!autodocs'],
  component: Grid,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    cols: {
      control: 'text',
    },
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    cols: '1fr 1fr',
    gap: 'md',
    children: (
      <>
        <Panel label="Cell one" />
        <Panel label="Cell two" />
      </>
    ),
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '56rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Grid>

export default meta

type Story = StoryObj<typeof meta>

export const TwoEqual: Story = {
  name: 'Two Equal (1fr 1fr)',
  args: {
    cols: '1fr 1fr',
    children: (
      <>
        <Panel label="1fr" />
        <Panel label="1fr" />
      </>
    ),
  },
}

export const Asymmetric: Story = {
  name: 'Asymmetric (1fr 2fr)',
  args: {
    cols: '1fr 2fr',
    children: (
      <>
        <Panel label="1fr" />
        <Panel label="2fr" />
      </>
    ),
  },
}

export const ThreeColumns: Story = {
  name: 'Three Columns (1fr 1fr 1fr)',
  args: {
    cols: '1fr 1fr 1fr',
    children: (
      <>
        <Panel label="1fr" />
        <Panel label="1fr" />
        <Panel label="1fr" />
      </>
    ),
  },
}
