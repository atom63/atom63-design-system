import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { NoticeBlock } from './notice-block'

const meta = {
  title: 'MDX/Foundations/Notice',
  tags: ['!autodocs'],
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
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Insight: Story = {
  render: () => (
    <NoticeBlock
      body="A useful system defines stable inputs, semantic procedures, and product constraints."
      label="Key idea"
      mode="insight"
      title="Design systems are product generation rules"
    />
  ),
}

export const Callout: Story = {
  render: () => (
    <NoticeBlock mode="callout" tone="warning">
      Check the consumer stylesheet before judging a block in isolation.
    </NoticeBlock>
  ),
}
