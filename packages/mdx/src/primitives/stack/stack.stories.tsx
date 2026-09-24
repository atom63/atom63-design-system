import { Stack } from '@atom63/mdx/primitives'
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
  title: 'MDX/Primitives/Stack',
  tags: ['!autodocs'],
  component: Stack,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    gap: 'md',
    children: (
      <>
        <Panel label="First" />
        <Panel label="Second" />
        <Panel label="Third" />
      </>
    ),
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stack>

export default meta

type Story = StoryObj<typeof meta>

export const SmallGap: Story = {
  name: 'Gap sm',
  args: { gap: 'sm' },
}

export const MediumGap: Story = {
  name: 'Gap md',
  args: { gap: 'md' },
}

export const LargeGap: Story = {
  name: 'Gap lg',
  args: { gap: 'lg' },
}

export const AllGaps: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(['sm', 'md', 'lg'] as const).map(gap => (
        <div key={gap}>
          <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">gap={gap}</p>
          <Stack gap={gap}>
            <Panel label="First" />
            <Panel label="Second" />
          </Stack>
        </div>
      ))}
    </div>
  ),
}
