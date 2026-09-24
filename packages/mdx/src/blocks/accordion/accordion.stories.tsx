import { Accordion } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/Accordion',
  tags: ['!autodocs'],
  component: Accordion,
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
} satisfies Meta<typeof Accordion>

export default meta

type Story = StoryObj<typeof meta>

export const SingleCollapsible: Story = {
  name: 'Single (collapsible)',
  args: {
    children: null,
  },
  render: () => (
    <Accordion type="single" collapsible defaultValue="tokens">
      <Accordion.Item value="tokens">
        <Accordion.Trigger>What is a design token?</Accordion.Trigger>
        <Accordion.Content>
          <p>
            A named, reusable value — a color, spacing step, or radius — that components read
            instead of hardcoding raw values.
          </p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="semantic">
        <Accordion.Trigger>Why prefer semantic tokens?</Accordion.Trigger>
        <Accordion.Content>
          <p>
            Semantic tokens carry intent (`primary`, `destructive`), so a single theme change
            restyles every consumer consistently.
          </p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="themes">
        <Accordion.Trigger>How do themes work?</Accordion.Trigger>
        <Accordion.Content>
          <p>
            Each theme remaps the semantic layer to different primitives without touching component
            markup.
          </p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
}

export const Multiple: Story = {
  name: 'Multiple (independent panels)',
  args: {
    children: null,
  },
  render: () => (
    <Accordion type="multiple" defaultValue={['a', 'b']}>
      <Accordion.Item value="a">
        <Accordion.Trigger>First — open by default</Accordion.Trigger>
        <Accordion.Content>
          <p>With `type="multiple"`, several panels can be open at once.</p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Trigger>Second — also open by default</Accordion.Trigger>
        <Accordion.Content>
          <p>`defaultValue` accepts an array in multiple mode.</p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="c">
        <Accordion.Trigger>Third — starts closed</Accordion.Trigger>
        <Accordion.Content>
          <p>Toggling this one does not close the others.</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
}
