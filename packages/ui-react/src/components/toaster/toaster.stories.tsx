import { Button, Toaster, toast } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Toaster',
  component: Toaster,
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
  },
  args: { position: 'bottom-right' },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/*
 * The Toaster renders nothing until something raises a toast, so the story
 * ships the triggers alongside it. One Toaster per app, mounted at the root.
 */
export const Playground: Story = {
  render: args => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.success('Page copied as Markdown')} variant="outline">
        Success
      </Button>
      <Button onClick={() => toast.error('Failed to copy to clipboard')} variant="outline">
        Error
      </Button>
      <Button onClick={() => toast.info('Tokens reloaded')} variant="outline">
        Info
      </Button>
      <Button onClick={() => toast.warning('Unsaved theme changes')} variant="outline">
        Warning
      </Button>
      <Toaster {...args} />
    </div>
  ),
}
