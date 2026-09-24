import { CreditsBlock } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/CreditsBlock',
  tags: ['!autodocs'],
  component: CreditsBlock,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
  },
  args: {
    credits: [
      { role: 'Design', credits: 'ATOM63' },
      { role: 'Engineering', credits: 'ATOM63' },
      { role: 'Words', credits: 'ATOM63' },
      { role: 'Photography', credits: 'Unsplash contributors' },
    ],
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreditsBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomLabel: Story = {
  args: {
    label: 'Colophon',
    credits: [
      { role: 'Typeface', credits: 'Inter · JetBrains Mono' },
      { role: 'Framework', credits: 'React · Vite' },
    ],
  },
}
