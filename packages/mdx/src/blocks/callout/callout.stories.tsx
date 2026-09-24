import { Callout } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

/** Colocated story (folder-per-block, mirroring @atom63/ui-react). */
const meta = {
  title: 'MDX/Blocks/Callout',
  tags: ['!autodocs'],
  component: Callout,
  parameters: { layout: 'padded' },
  argTypes: {
    type: { control: 'select', options: ['info', 'warning', 'error', 'success'] },
  },
  args: {
    type: 'info',
    children: 'Semantic colors should always be preferred over raw primitives in product UI.',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Callout>

export default meta

type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    type: 'info',
    children: 'Use semantic tokens like primary and destructive instead of raw color values.',
  },
}

export const Warning: Story = {
  args: {
    type: 'warning',
    children: 'Changing the typography scale affects all text sizes proportionally.',
  },
}

export const ErrorVariant: Story = {
  name: 'Error',
  args: {
    type: 'error',
    children: 'Never hardcode pixel values — use the token system.',
  },
}

export const Success: Story = {
  args: {
    type: 'success',
    children: 'All components pass WCAG AA contrast requirements in both themes.',
  },
}

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Callout type="info">
        <p>
          <strong>Info</strong> — general guidance and tips.
        </p>
      </Callout>
      <Callout type="warning">
        <p>
          <strong>Warning</strong> — something to be careful about.
        </p>
      </Callout>
      <Callout type="error">
        <p>
          <strong>Error</strong> — a constraint or hard rule.
        </p>
      </Callout>
      <Callout type="success">
        <p>
          <strong>Success</strong> — a confirmed best practice.
        </p>
      </Callout>
    </div>
  ),
}
