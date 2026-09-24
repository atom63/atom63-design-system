import { CodeBlock, Compare } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/Compare',
  tags: ['!autodocs'],
  component: Compare,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '56rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Compare>

export default meta

type Story = StoryObj<typeof meta>

export const BeforeAfter: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Compare
      description="Use compare blocks when the teaching intent depends on contrast."
      title="Patch CSS vs system CSS"
    >
      <Compare.Item eyebrow="Before" title="Local patch" tone="negative">
        <p>Values are invented for the immediate screen.</p>
        <CodeBlock
          code={`.card {\n  padding: 23px;\n  color: #52525b;\n}`}
          lang="css"
          variant="embedded"
        />
      </Compare.Item>
      <Compare.Item eyebrow="After" title="System contract" tone="positive">
        <p>Values come from semantic tokens that can evolve together.</p>
        <CodeBlock
          code={`.card {\n  padding: var(--space-6);\n  color: var(--color-text-muted);\n}`}
          lang="css"
          variant="embedded"
        />
      </Compare.Item>
    </Compare>
  ),
}

export const DenseChineseContent: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Compare description="用于文章中解释两种设计系统思路的差异。" title="样式修补 vs 系统约束">
      <Compare.Item eyebrow="Before" title="把每个页面当成独立问题" tone="warning">
        <p>组件只解决眼前的排版，颜色、间距和圆角都跟随当前页面的直觉变化。</p>
        <ul>
          <li>短期速度很快。</li>
          <li>长期会积累难以同步的视觉债务。</li>
        </ul>
      </Compare.Item>
      <Compare.Item eyebrow="After" title="把页面当成系统规则的输出" tone="positive">
        <p>设计决策先进入 token、语义层和组件状态，再被页面组合使用。</p>
        <ul>
          <li>AI 可以在明确边界内生成界面。</li>
          <li>主题、文案和平台变化更容易被统一吸收。</li>
        </ul>
      </Compare.Item>
    </Compare>
  ),
}
