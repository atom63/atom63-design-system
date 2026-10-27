import { toasterContract } from '@atom63/ui-foundation'
import { Button, Toaster, toast } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'

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
    variant: { control: 'inline-radio', options: toasterContract.variants },
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

/* Playground in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...Playground, globals: { mode: 'dark' } }

function RaiseOnMount() {
  useEffect(() => {
    toast.loading('Scheduling message…', { id: 'inverse-story' })
    return () => {
      toast.dismiss('inverse-story')
    }
  }, [])
  return null
}

async function findInverseToast(): Promise<HTMLElement> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const element = document.querySelector<HTMLElement>('.a63-Toast--inverse[data-mounted="true"]')
    if (element) return element
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  throw new Error('Expected the inverse toast')
}

/*
 * variant="inverse": a compact pill in the inverse colours with the status icon
 * after the message, the macOS and iOS look for a short status. It is dark on a
 * light app and light on a dark one.
 */
export const Inverse: Story = {
  args: { position: 'bottom-center', variant: 'inverse' },
  render: args => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.loading('Scheduling message…')} variant="outline">
        Loading
      </Button>
      <Button onClick={() => toast.success('Message sent')} variant="outline">
        Success
      </Button>
      <RaiseOnMount />
      <Toaster {...args} />
    </div>
  ),
  play: async () => {
    const pill = await findInverseToast()
    const style = getComputedStyle(pill)
    if (style.borderTopLeftRadius !== '9999px') {
      throw new Error(`Expected a pill, got ${style.borderTopLeftRadius}`)
    }
    const icon = pill.querySelector<HTMLElement>('[data-icon]')
    const title = pill.querySelector<HTMLElement>('[data-title]')
    if (!icon || !title) throw new Error('Expected an icon and a message')
    if (icon.getBoundingClientRect().left < title.getBoundingClientRect().right) {
      throw new Error('Expected the icon after the message')
    }
    if (pill.getBoundingClientRect().width >= 356) {
      throw new Error('Expected the pill to hug its message')
    }
  },
}
