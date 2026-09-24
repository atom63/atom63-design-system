import { LayerStack } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/LayerStack',
  tags: ['!autodocs'],
  component: LayerStack,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '64rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LayerStack>

export default meta

type Story = StoryObj<typeof meta>

export const PrimitiveProcedureProduct: Story = {
  args: {
    title: 'Primitive / Procedure / Product',
    description: 'A compact model for explaining where AI should be constrained.',
    layers: [
      {
        label: 'Primitive',
        title: 'Stable materials',
        metaphor: 'Ingredients and base seasoning',
        description: 'Raw tokens, palettes, type scale, spacing, radius.',
        constraint: 'AI chooses from the material pool instead of guessing values.',
      },
      {
        label: 'Procedure',
        title: 'Semantic rules',
        metaphor: 'Recipes and heat control',
        description: 'Semantic tokens, component states, theme rules.',
        constraint: 'AI composes through documented rules and variants.',
      },
      {
        label: 'Product',
        title: 'Rendered experience',
        metaphor: 'The plated dish',
        description: 'Pages, product UI, and business workflows.',
        constraint: 'AI produces UI as the result of system rules.',
      },
    ],
  },
}

export const ChineseCourseModel: Story = {
  args: {
    title: '从材料到产品',
    description: '用于解释设计系统如何把抽象原则变成可执行的产品界面。',
    labels: { metaphor: '隐喻', description: '系统位置', constraint: '对 AI 的约束' },
    layers: [
      {
        label: '材料',
        title: '稳定的视觉输入',
        metaphor: '字体、颜色、间距、圆角和阴影像一套可复用的原料。',
        description: '它们不直接决定界面，而是提供可被组合的基础。',
        constraint: 'AI 不能随意发明新值，只能从系统允许的材料中选择。',
      },
      {
        label: '语义',
        title: '把材料映射到意图',
        metaphor: '同一种颜色在不同语义下会承担不同职责。',
        description: '例如 primary、muted、border、surface 这些命名让设计决策可被讨论。',
        constraint: 'AI 必须说明它使用的是哪类语义，而不是只描述视觉效果。',
      },
      {
        label: '产品',
        title: '真实界面中的约束结果',
        metaphor: '页面不是自由拼贴，而是系统规则在具体业务中的落地。',
        description: '导航、文章、表单和工具面板都应该继承同一套系统边界。',
        constraint: 'AI 输出的页面需要能被主题、语言和设备尺寸继续适配。',
      },
    ],
  },
}
