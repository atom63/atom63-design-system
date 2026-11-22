import { createAgentRuntime, getMessageText } from '@atom63/agent'
import { useOwnedAgentRuntime } from '@atom63/agent/react'
import { Sheet, SheetContent } from '@atom63/ui-react'
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

import { portfolio } from '../../portfolio.config'
import { ChatPanel } from '../../templates/blocks/chat-panel/chat-panel'
import { transport } from './transport'

type AssistantState = { open: () => void }

const AssistantContext = createContext<AssistantState | null>(null)

/** Opens the assistant; null when the module is off. */
export function useAssistant(): AssistantState | null {
  return useContext(AssistantContext)
}

const firstName = portfolio.person.name.split(' ')[0]

const suggestions = [
  `What has ${firstName} worked on?`,
  'Tell me about the trip planner',
  'How do I get in touch?',
]

/*
 * The conversation, on the right edge. The runtime lives in the site layout,
 * so it survives navigation; the chat panel block draws it, and this maps the
 * runtime's state onto the panel's props.
 */
function AssistantSheet({
  onOpenChange,
  open,
  runtime,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
  runtime: ReturnType<typeof createAgentRuntime>
}) {
  const state = useSyncExternalStore(runtime.subscribe, runtime.getState)
  const messages = state.messages.flatMap(message =>
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent aria-label="Assistant" className="p-0" showCloseButton={false} side="right">
        <ChatPanel
          attach={<></>}
          disclaimer="Answers come from this site's content."
          greeting={`Ask about ${firstName}'s work`}
          messages={messages}
          onClose={() => onOpenChange(false)}
          onNewChat={() => runtime.clear()}
          onSend={text => void runtime.send({ text })}
          onStop={() => runtime.stop()}
          status={status}
          suggestions={suggestions}
          title="Assistant"
        />
      </SheetContent>
    </Sheet>
  )
}

/** The site assistant: a runtime from @atom63/agent and a sheet to talk to it in. */
export function AssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const runtime = useOwnedAgentRuntime(() =>
    createAgentRuntime({
      getSystemPrompt: () =>
        `You answer visitors' questions about ${portfolio.person.name}, a ${portfolio.person.role}, from their portfolio.`,
      historyLimit: 12,
      transport,
    })
  )
  const value = useMemo(() => ({ open: () => setOpen(true) }), [])

  return (
    <AssistantContext.Provider value={value}>
      {children}
      <AssistantSheet onOpenChange={setOpen} open={open} runtime={runtime} />
    </AssistantContext.Provider>
  )
}
