import { FigureBlock } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const SRC = 'https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=1200'

const meta = {
  title: 'MDX/Blocks/FigureBlock',
  tags: ['!autodocs'],
  component: FigureBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    alt: 'A wide desert landscape at dusk',
    src: SRC,
    enableLightbox: false,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FigureBlock>

export default meta

type Story = StoryObj<typeof meta>

export const StringCaption: Story = {
  args: {
    caption: 'Figure 1 — a plain string caption.',
  },
}

export const RichCaptionSlot: Story = {
  render: args => (
    <FigureBlock {...args}>
      <FigureBlock.Caption>
        A caption with <a href="https://unsplash.com">the Unsplash source</a> and <em>emphasis</em>.
      </FigureBlock.Caption>
    </FigureBlock>
  ),
}

export const WithAside: Story = {
  render: args => (
    <FigureBlock {...args}>
      <FigureBlock.Caption>Figure 2 — landscape study.</FigureBlock.Caption>
      <FigureBlock.Aside>Source: Unsplash · shot on 35mm</FigureBlock.Aside>
    </FigureBlock>
  ),
}
