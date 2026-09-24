import { Stagger } from '@atom63/mdx/primitives'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

function Item({ label }: { label: string }) {
  return (
    <div className="border-border text-secondary-foreground rounded-lg border p-4 text-sm">
      {label}
    </div>
  )
}

const meta = {
  title: 'MDX/Primitives/Stagger',
  tags: ['!autodocs'],
  component: Stagger,
  parameters: {
    layout: 'padded',
  },
  args: {
    className: 'flex flex-col gap-3',
    children: (
      <>
        <Item label="First item" />
        <Item label="Second item" />
        <Item label="Third item" />
        <Item label="Fourth item" />
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
} satisfies Meta<typeof Stagger>

export default meta

type Story = StoryObj<typeof meta>

/** Direct children animate in one after another as the group enters the viewport. */
export const Default: Story = {}

export const GridOfCards: Story = {
  args: {
    className: 'grid grid-cols-2 gap-3',
    children: (
      <>
        <Item label="Card one" />
        <Item label="Card two" />
        <Item label="Card three" />
        <Item label="Card four" />
      </>
    ),
  },
}
