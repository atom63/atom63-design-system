import { chatStepsStatuses } from '@atom63/ui-foundation'
import { ChatMessage, ChatStep, ChatSteps } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Wrench } from 'lucide-react'

import { ThemeMatrix } from '../story-probes'

const meta = {
  title: 'UI React/ChatSteps',
  component: ChatSteps,
  args: { defaultOpen: true, label: 'Used 3 tools' },
  decorators: [
    Story => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatSteps>

export default meta
type Story = StoryObj<typeof meta>

const steps = (
  <>
    <ChatStep description="“restaurants” in October" status="complete">
      Searched transactions
    </ChatStep>
    <ChatStep status="complete">Compared with September</ChatStep>
    <ChatStep status="running">Drafting a budget</ChatStep>
  </>
)

export const Playground: Story = {
  render: args => <ChatSteps {...args}>{steps}</ChatSteps>,
}

/* Each status has its own icon and a text status for screen readers. */
export const Statuses: Story = {
  render: args => (
    <ChatSteps {...args} label="Every status">
      {chatStepsStatuses.map(status => (
        <ChatStep key={status} status={status}>
          {`A ${status} step`}
        </ChatStep>
      ))}
    </ChatSteps>
  ),
}

/* Closed once the reply is done, above the answer; the reader can open it. */
export const AboveAnswer: Story = {
  render: () => (
    <ChatMessage from="assistant">
      <ChatSteps icon={<Wrench />} label="Used 3 tools">
        {steps}
      </ChatSteps>
      <p>You spent 212 on restaurants in October, 40 more than in September.</p>
    </ChatMessage>
  ),
}

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <ChatSteps defaultOpen label="استخدم أداتين">
        <ChatStep status="complete" statusLabel="تم">
          البحث في المعاملات
        </ChatStep>
        <ChatStep status="running" statusLabel="قيد التنفيذ">
          إعداد الميزانية
        </ChatStep>
      </ChatSteps>
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <ThemeMatrix>
      <ChatSteps defaultOpen label="Used 3 tools">
        {steps}
        <ChatStep status="error">Fetched exchange rates</ChatStep>
      </ChatSteps>
    </ThemeMatrix>
  ),
}
