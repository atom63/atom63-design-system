import { Steps } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/Steps',
  tags: ['!autodocs'],
  component: Steps,
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
} satisfies Meta<typeof Steps>

export default meta

type Story = StoryObj<typeof meta>

export const InstallGuide: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Steps>
      <Steps.Step title="Install the package">
        <p>Add `@atom63/mdx` to your app with your package manager of choice.</p>
        <div className="border-border bg-muted/40 text-muted-foreground mt-2 rounded-lg border p-3 font-mono text-sm">
          pnpm add @atom63/mdx
        </div>
      </Steps.Step>
      <Steps.Step title="Configure the provider">
        <p>Wrap your MDX content in the content provider so blocks pick up prose context.</p>
      </Steps.Step>
      <Steps.Step title="Deploy">
        <p>Build and ship — steps are static and SSR-safe, so there is no client runtime cost.</p>
      </Steps.Step>
    </Steps>
  ),
}

export const AutoNumbering: Story = {
  name: 'Auto-numbering + spine',
  args: {
    children: null,
  },
  render: () => (
    <Steps>
      <Steps.Step title="First">
        <p>
          Steps are numbered 1..n automatically in document order — authors never number by hand.
        </p>
      </Steps.Step>
      <Steps.Step title="Second">
        <p>A connector spine links each numbered badge to the next.</p>
      </Steps.Step>
      <Steps.Step title="Third">
        <p>The spine is hidden after the final step.</p>
      </Steps.Step>
      <Steps.Step title="Fourth">
        <p>Add or reorder steps freely; the numbering stays correct.</p>
      </Steps.Step>
    </Steps>
  ),
}
