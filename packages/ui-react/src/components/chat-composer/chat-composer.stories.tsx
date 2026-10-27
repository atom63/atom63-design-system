import { chatComposerLayouts, chatComposerStatuses } from '@atom63/ui-foundation'
import { Button, ChatComposer } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Mic, Plus } from 'lucide-react'
import { useState } from 'react'

import { ThemeMatrix } from '../story-probes'

const meta = {
  title: 'UI React/ChatComposer',
  component: ChatComposer,
  argTypes: {
    layout: { control: 'inline-radio', options: chatComposerLayouts },
    status: { control: 'inline-radio', options: chatComposerStatuses },
  },
  args: {
    footnote: 'AI can make mistakes. Check important info.',
    placeholder: 'Ask anything',
    status: 'idle',
  },
  decorators: [
    Story => (
      <div style={{ inlineSize: 640, maxInlineSize: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatComposer>

export default meta
type Story = StoryObj<typeof meta>

const attach = (
  <Button aria-label="Attach a file" shape="round" size="icon-sm" variant="ghost">
    <Plus aria-hidden />
  </Button>
)

const mic = (
  <Button aria-label="Dictate" shape="round" size="icon-sm" variant="ghost">
    <Mic aria-hidden />
  </Button>
)

export const Playground: Story = {
  args: { actions: mic, attach },
}

/* With onVoice, an empty composer shows a voice button where send goes; it
   becomes the send button once there is text. */
export const Voice: Story = {
  args: { actions: mic, attach, onVoice: () => {} },
}

/* While a reply streams the send button is a stop button. */
export const Streaming: Story = {
  args: { actions: mic, attach, defaultValue: '', status: 'streaming' },
}

/* Text with a line break (or text that wraps) turns the inline row into a
   block: the field on top, the controls in a row under it. */
export const WithText: Story = {
  args: {
    attach,
    defaultValue:
      'Draft a short note to my landlord asking to move the inspection to next Tuesday.\nKeep it friendly.',
  },
}

/* The stacked layout keeps the controls in a row under the field, for a
   composer with several actions such as a model picker. */
export const Stacked: Story = {
  args: { actions: mic, attach, layout: 'stacked' },
}

export const Disabled: Story = {
  args: { attach, disabled: true, placeholder: 'Chat is unavailable' },
}

/* The host owns the text: it can prefill it from a suggestion and clear it
   after sending. */
function ControlledComposer(args: React.ComponentProps<typeof ChatComposer>) {
  const [value, setValue] = useState('')
  const [sent, setSent] = useState<string[]>([])
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <ChatComposer
        {...args}
        onSubmit={text => {
          setSent(previous => [...previous, text])
          setValue('')
        }}
        onValueChange={setValue}
        value={value}
      />
      <output aria-label="Sent messages" style={{ color: 'var(--a63-text-secondary)' }}>
        {sent.length ? sent.join(' · ') : 'Nothing sent yet'}
      </output>
    </div>
  )
}

export const Controlled: Story = {
  render: args => <ControlledComposer {...args} />,
}

export const RightToLeft: Story = {
  args: {
    attach,
    footnote: 'قد يخطئ الذكاء الاصطناعي. تحقق من المعلومات المهمة.',
    label: 'الرسالة',
    placeholder: 'اسأل أي شيء',
    sendLabel: 'إرسال',
  },
  render: args => (
    <div dir="rtl" lang="ar">
      <ChatComposer {...args} />
    </div>
  ),
}

export const Themes: Story = {
  render: args => (
    <ThemeMatrix>
      <div style={{ display: 'grid', gap: 12 }}>
        <ChatComposer {...args} attach={attach} footnote={undefined} />
        <ChatComposer {...args} attach={attach} footnote={undefined} status="streaming" />
        <ChatComposer
          {...args}
          attach={attach}
          defaultValue="Summarise this thread"
          footnote={undefined}
          layout="stacked"
        />
      </div>
    </ThemeMatrix>
  ),
}
