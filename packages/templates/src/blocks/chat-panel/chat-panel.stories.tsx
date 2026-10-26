import { AgentTransportError, createAgentRuntime, getMessageText } from '@atom63/agent'
import type { AgentTransport } from '@atom63/agent'
import { useOwnedAgentRuntime } from '@atom63/agent/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useSyncExternalStore } from 'react'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { ChatPanel, type ChatPanelMessage } from './chat-panel'

const meta = {
  title: 'Templates/Blocks/Chat panel',
  component: ChatPanel,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ChatPanel>

export default meta

type Story = StoryObj<typeof meta>

const messages: readonly ChatPanelMessage[] = [
  { from: 'user', id: 'm1', text: 'Why did my spending go up this month?' },
  {
    from: 'assistant',
    id: 'm2',
    steps: [
      { label: 'Searched October transactions', status: 'complete' },
      { label: 'Compared with September', status: 'complete' },
    ],
    text: 'You spent 18% more than in September. Most of it is restaurants (212 across three weekend dinners) and one train ticket on the 14th.',
  },
  { from: 'user', id: 'm3', text: 'Set a restaurant budget of 300 for November.' },
]

const noop = () => {}

const args = {
  messages,
  onClose: noop,
  onFeedback: noop,
  onNewChat: noop,
  onSend: noop,
  onStop: noop,
  suggestions: ['Summarise my month', 'Find subscriptions', 'Plan a budget'],
}

/* The layout places the panel; here it sits beside a stand-in for the product. */
const beside = (children: React.ReactNode) => (
  <div className="bg-background text-foreground flex h-[40rem]">
    <div className="text-muted-foreground flex-1 p-6 text-sm">Product content</div>
    <div className="border-border w-full max-w-sm border-s">{children}</div>
  </div>
)

export const Desktop: Story = { args, render: props => beside(<ChatPanel {...props} />) }

export const Phone: Story = {
  args,
  globals: phoneGlobals,
  render: props => (
    <div className="h-[44rem]">
      <ChatPanel {...props} />
    </div>
  ),
}

/* No messages yet: the start screen with a greeting and suggestion chips. */
export const StartScreen: Story = {
  args: { ...args, messages: [] },
  render: props => beside(<ChatPanel {...props} />),
}

/* A reply in progress: the running step is open, the dots hold the reply's
   place, and send is a stop button. */
export const Streaming: Story = {
  args: {
    ...args,
    messages: [
      ...messages,
      {
        from: 'assistant',
        id: 'm4',
        steps: [{ label: 'Creating the budget', status: 'running' }],
        streaming: true,
        text: '',
      },
    ],
    status: 'streaming',
  },
  render: props => beside(<ChatPanel {...props} />),
}

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <div className="border-border h-[32rem] max-w-sm border">
        <ChatPanel {...props} />
      </div>
    </ThemeMatrix>
  ),
}

/* A fake transport that streams a canned reply word by word. Type "fail" to
   see a failed run. */
const cannedTransport: AgentTransport = {
  async *stream(request) {
    const last = request.messages.at(-1)
    yield { runId: request.runId, type: 'response-start' }
    if (last?.content.toLowerCase().includes('fail')) {
      throw new AgentTransportError({
        code: 'network',
        message: 'The demo transport failed on purpose.',
        retryable: true,
      })
    }
    for (const word of 'This reply streams from a fake transport, one word at a time.'.split(
      /(?<= )/
    )) {
      await new Promise(resolve => setTimeout(resolve, 60))
      yield { delta: word, runId: request.runId, type: 'text-delta' }
    }
    yield { runId: request.runId, type: 'finish' }
  },
}

/*
 * The panel driven by @atom63/agent. The block does not import the runtime;
 * this host maps the runtime's state onto the panel's props: each message to
 * { id, from, text, streaming }, and the runtime status to the composer's.
 */
function AgentChatPanel() {
  const runtime = useOwnedAgentRuntime(() =>
    createAgentRuntime({ getSystemPrompt: () => 'You are a demo.', transport: cannedTransport })
  )
  const state = useSyncExternalStore(runtime.subscribe, runtime.getState)
  const panelMessages = state.messages.flatMap(message =>
    message.role === 'system'
      ? []
      : [
          {
            from: message.role,
            id: message.id,
            streaming: message.status === 'streaming',
            text:
              message.status === 'error'
                ? (message.error?.message ?? 'Something went wrong.')
                : getMessageText(message),
          },
        ]
  )
  const status =
    state.status === 'submitted' || state.status === 'streaming' ? state.status : 'idle'
  return (
    <ChatPanel
      messages={panelMessages}
      onNewChat={() => runtime.clear()}
      onSend={text => void runtime.send({ text })}
      onStop={() => runtime.stop()}
      status={status}
      suggestions={['Say hello', 'Make it fail']}
    />
  )
}

export const WithAgentRuntime: Story = {
  args,
  render: () => beside(<AgentChatPanel />),
}
