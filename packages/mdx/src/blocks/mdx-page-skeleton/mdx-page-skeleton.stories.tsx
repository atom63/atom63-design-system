import { MdxPageSkeleton } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/Page Skeleton',
  tags: ['!autodocs'],
  component: MdxPageSkeleton,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['docs', 'lesson'] },
    showInlineToc: { control: 'boolean' },
    showRail: { control: 'boolean' },
  },
  args: {
    variant: 'docs',
    showInlineToc: true,
    showRail: true,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '64rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MdxPageSkeleton>

export default meta

type Story = StoryObj<typeof meta>

export const DocsVariant: Story = {
  name: 'Docs variant',
  args: { variant: 'docs' },
}

export const Lesson: Story = {
  args: { variant: 'lesson' },
}

export const NoRail: Story = {
  name: 'No rail',
  args: { showRail: false },
}

export const NoInlineToc: Story = {
  name: 'No inline TOC',
  args: { showInlineToc: false },
}
