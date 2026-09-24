import { PageMeta } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/PageMeta',
  tags: ['!autodocs'],
  component: PageMeta,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    eyebrow: { control: 'text' },
    meta: { control: 'text' },
  },
  args: {
    eyebrow: 'Guide',
    meta: '8 min read',
    title: 'Designing with tokens',
    description:
      'How the semantic token system keeps color, spacing, and typography consistent across every surface.',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageMeta>

export default meta

type Story = StoryObj<typeof meta>

export const Full: Story = {}

export const TitleOnly: Story = {
  args: {
    eyebrow: undefined,
    meta: undefined,
    description: undefined,
    title: 'Just a title',
  },
}
