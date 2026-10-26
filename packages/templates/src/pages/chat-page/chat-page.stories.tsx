import type { Meta, StoryObj } from '@storybook/react-vite'

import type { ChatPanelMessage } from '../../blocks/chat-panel/chat-panel'
import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { ChatPage } from './chat-page'

const meta = {
  title: 'Templates/Pages/Chat page',
  component: ChatPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ChatPage>

export default meta

type Story = StoryObj<typeof meta>

const messages: readonly ChatPanelMessage[] = [
  { from: 'user', id: 'm1', text: 'Draft a launch note for the new invoices page.' },
  {
    from: 'assistant',
    id: 'm2',
    steps: [
      { label: 'Read the release checklist', status: 'complete' },
      { label: 'Read the invoices page spec', status: 'complete' },
    ],
    text: 'Here is a short launch note:\n\nInvoices now have their own page. Filter by status, search by customer, and open any invoice in a side panel without losing your place in the list.',
  },
  { from: 'user', id: 'm3', text: 'Make it friendlier and add a line about exports.' },
]

const noop = () => {}

const args = {
  conversations: [
    { current: true, href: '#launch-note', title: 'Launch note for invoices' },
    { href: '#churn', title: 'Why did churn rise in Q3?' },
    { href: '#sql', title: 'SQL for monthly revenue' },
    { href: '#onboarding', title: 'Onboarding email ideas' },
  ],
  messages,
  onNewChat: noop,
  onSend: noop,
  onStop: noop,
  productName: 'Acme AI',
  suggestions: ['Summarise a document', 'Write a SQL query', 'Draft an email'],
}

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

/* A new chat: the large greeting, the composer and suggestion chips. */
export const StartScreen: Story = { args: { ...args, messages: [] } }

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix frame>
      <ChatPage {...props} />
    </ThemeMatrix>
  ),
}
