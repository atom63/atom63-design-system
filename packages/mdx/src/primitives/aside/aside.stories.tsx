import { Aside } from '@atom63/mdx/primitives'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const bodyCopy = (
  <>
    <p className="text-secondary-foreground text-sm leading-relaxed">
      A design system treats personal work like a real product. It encodes decisions once, then
      replays them across every surface so that the tenth page costs a fraction of the first.
    </p>
    <p className="text-secondary-foreground mt-4 text-sm leading-relaxed">
      At wide viewports the aside floats into the margin; at narrow widths it collapses inline above
      the paragraph it annotates. Resize the preview to see the two states.
    </p>
  </>
)

const meta = {
  title: 'MDX/Primitives/Aside',
  tags: ['!autodocs'],
  component: Aside,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['left', 'right'],
    },
  },
  args: {
    side: 'right',
    children: 'A margin note that floats beside the body copy on wide screens.',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '42rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Aside>

export default meta

type Story = StoryObj<typeof meta>

export const RightSide: Story = {
  name: 'Side right',
  render: args => (
    <div>
      <Aside {...args} />
      {bodyCopy}
    </div>
  ),
  args: { side: 'right' },
}

export const LeftSide: Story = {
  name: 'Side left',
  render: args => (
    <div>
      <Aside {...args} />
      {bodyCopy}
    </div>
  ),
  args: {
    side: 'left',
    children: 'A margin note anchored to the left gutter.',
  },
}
