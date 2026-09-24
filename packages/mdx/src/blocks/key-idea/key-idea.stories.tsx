import { KeyIdea } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/KeyIdea',
  tags: ['!autodocs'],
  component: KeyIdea,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KeyIdea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Design systems are product generation rules',
    children:
      'A useful system defines the stable inputs, semantic procedures, and product constraints that AI can safely operate inside.',
  },
}

export const ChineseArticleNote: Story = {
  args: {
    label: '核心观点',
    title: '设计系统不是组件仓库，而是产品生成规则',
    children:
      '真正有用的系统会把可变的视觉判断转化为稳定的材料、语义流程和产品约束。这样人和 AI 都能在同一套边界里做决定。',
  },
}
