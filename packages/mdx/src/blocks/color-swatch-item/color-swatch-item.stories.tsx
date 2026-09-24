import { ColorSwatchItem } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/ColorSwatchItem',
  tags: ['!autodocs'],
  component: ColorSwatchItem,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    name: { control: 'text' },
    variable: { control: 'text' },
  },
  args: {
    name: 'Primary',
    variable: '--primary',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColorSwatchItem>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    name: 'Primary',
    variable: '--primary',
  },
}

export const Muted: Story = {
  args: {
    name: 'Muted',
    variable: '--muted',
  },
}

export const Grid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ColorSwatchItem name="Background" variable="--background" />
      <ColorSwatchItem name="Foreground" variable="--foreground" />
      <ColorSwatchItem name="Primary" variable="--primary" />
      <ColorSwatchItem name="Muted" variable="--muted" />
      <ColorSwatchItem name="Accent" variable="--accent" />
      <ColorSwatchItem name="Destructive" variable="--destructive" />
    </div>
  ),
}
