import { Bleed } from '@atom63/mdx/primitives'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Primitives/Bleed',
  tags: ['!autodocs'],
  component: Bleed,
  parameters: {
    layout: 'padded',
  },
  args: {
    children: (
      <div className="border-border bg-muted text-secondary-foreground rounded-lg border p-6 text-center text-sm">
        This block breaks out of the narrow column to full viewport width.
      </div>
    ),
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Bleed>

export default meta

type Story = StoryObj<typeof meta>

/** Bleed sits inside a narrow column so the full-bleed break-out is visible. */
export const Default: Story = {
  render: args => (
    <div className="mx-auto max-w-[24rem]">
      <p className="text-secondary-foreground text-sm">
        This paragraph is constrained to a narrow 24rem column.
      </p>
      <div className="my-4">
        <Bleed {...args} />
      </div>
      <p className="text-secondary-foreground text-sm">
        Content after the bleed returns to the narrow column width.
      </p>
    </div>
  ),
}

export const FullWidthImage: Story = {
  render: () => (
    <div className="mx-auto max-w-[24rem]">
      <p className="text-secondary-foreground text-sm">Intro copy in a narrow column.</p>
      <div className="my-4">
        <Bleed>
          <div className="border-border bg-primary/10 text-primary flex h-40 items-center justify-center rounded-lg border text-sm">
            Full-bleed media band
          </div>
        </Bleed>
      </div>
      <p className="text-secondary-foreground text-sm">Closing copy back in the column.</p>
    </div>
  ),
}
