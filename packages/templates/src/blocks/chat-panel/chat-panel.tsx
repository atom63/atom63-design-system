import type { ChatComposerStatus, ChatStepStatus } from '@atom63/ui-foundation'
import {
  Avatar,
  AvatarFallback,
  Button,
  ChatComposer,
  ChatMessage,
  ChatMessageList,
  ChatStep,
  ChatSteps,
  ChatTypingIndicator,
  CopyButton,
} from '@atom63/ui-react'
import { Plus, Sparkles, SquarePen, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'

export const template = {
  id: 'chat-panel',
  kind: 'block',
  title: 'Chat panel',
  description:
    'An AI assistant beside the product: a side panel with a header, the transcript (user bubbles, plain assistant replies with tool steps, typing dots and copy and feedback actions), a start screen with suggestion chips when the conversation is empty, and the composer with send and stop and the AI disclaimer. ChatThread is the same conversation without the panel, for a full page. Wire it to @atom63/agent or any runtime through props.',
  category: 'ai',
  tags: [
    'chat',
    'assistant',
    'ai',
    'ai assistant',
    'agent',
    'copilot',
    'conversation',
    'messages',
    'side panel',
    'composer',
    'prompt',
    'suggestions',
  ],
  readiness: 'draft',
} as const

export interface ChatPanelStep {
  label: string
  status: ChatStepStatus
}

export interface ChatPanelMessage {
  from: 'assistant' | 'user'
  id: string
  /** Tool or thinking steps shown above an assistant reply. */
  steps?: readonly ChatPanelStep[]
  /** True while the reply is still arriving. */
  streaming?: boolean
  text: string
}

export interface ChatThreadProps {
  /** A leading composer control, such as an attach button; a `+` button by default. */
  attach?: ReactNode
  /** The line under the composer. */
  disclaimer?: string
  /** The start screen's heading when there are no messages. */
  greeting?: string
  /** `panel` fills a narrow column; `page` centres a reading-width column. */
  layout?: 'page' | 'panel'
  messages: readonly ChatPanelMessage[]
  /** Adds thumbs up and down to finished replies. */
  onFeedback?: (messageId: string, value: 'down' | 'up') => void
  onSend: (text: string) => void
  onStop?: () => void
  placeholder?: string
  /** `submitted` or `streaming` turns send into stop. */
  status?: ChatComposerStatus
  /** Starter prompts on the start screen; one tap sends it. */
  suggestions?: readonly string[]
}

const assistantAvatar = (
  <Avatar size="sm">
    <AvatarFallback>
      <Sparkles aria-hidden />
    </AvatarFallback>
  </Avatar>
)

function Reply({
  message,
  onFeedback,
}: {
  message: ChatPanelMessage
  onFeedback?: ChatThreadProps['onFeedback']
}) {
  const running = message.steps?.some(step => step.status === 'running') ?? false
  const done = !message.streaming && message.text !== ''
  return (
    <ChatMessage
      actions={
        done ? (
          <>
            <CopyButton label="Copy reply" size="icon-xs" value={message.text} />
            {onFeedback ? (
              <>
                <Button
                  aria-label="Good reply"
                  onClick={() => onFeedback(message.id, 'up')}
                  size="icon-xs"
                  variant="ghost"
                >
                  <ThumbsUp aria-hidden />
                </Button>
                <Button
                  aria-label="Bad reply"
                  onClick={() => onFeedback(message.id, 'down')}
                  size="icon-xs"
                  variant="ghost"
                >
                  <ThumbsDown aria-hidden />
                </Button>
              </>
            ) : null}
          </>
        ) : null
      }
      avatar={assistantAvatar}
      from="assistant"
      streaming={message.streaming}
    >
      {message.steps?.length ? (
        <ChatSteps
          defaultOpen={running}
          label={running ? 'Working' : `Used ${message.steps.length} tools`}
        >
          {message.steps.map(step => (
            <ChatStep key={step.label} status={step.status}>
              {step.label}
            </ChatStep>
          ))}
        </ChatSteps>
      ) : null}
      {message.text === '' && message.streaming ? (
        <ChatTypingIndicator />
      ) : (
        <p className="whitespace-pre-wrap">{message.text}</p>
      )}
    </ChatMessage>
  )
}

/*
 * The conversation: a scrolling transcript over the composer. With no
 * messages it shows the start screen, a greeting and suggestion chips. It
 * scrolls to the newest turn as turns arrive. It holds no conversation state:
 * the host passes the messages and status and handles send and stop, from
 * `@atom63/agent` (map each AgentMessage to { id, from: role, text:
 * getMessageText(message), streaming: status === 'streaming' }) or any other
 * runtime.
 */
export function ChatThread({
  attach,
  disclaimer = 'AI can make mistakes. Check important info.',
  greeting = 'How can I help?',
  layout = 'panel',
  messages,
  onFeedback,
  onSend,
  onStop,
  placeholder = 'Ask anything',
  status = 'idle',
  suggestions = [],
}: ChatThreadProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const last = messages.at(-1)
  const lastText = last?.text.length ?? 0

  useEffect(() => {
    const element = scroller.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages.length, lastText])

  const column = layout === 'page' ? 'mx-auto w-full max-w-3xl' : 'w-full'
  const composer = (
    <ChatComposer
      attach={
        attach ?? (
          <Button aria-label="Attach a file" shape="round" size="icon-sm" variant="ghost">
            <Plus aria-hidden />
          </Button>
        )
      }
      footnote={disclaimer}
      onStop={onStop}
      onSubmit={onSend}
      placeholder={placeholder}
      status={status}
    />
  )

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 py-8">
        <div className={`${column} flex flex-col gap-6`}>
          <h2
            className={`font-heading text-foreground text-center font-semibold ${
              layout === 'page' ? 'text-3xl' : 'text-xl'
            }`}
          >
            {greeting}
          </h2>
          {composer}
          {suggestions.length ? (
            <ul aria-label="Suggestions" className="flex flex-wrap justify-center gap-2">
              {suggestions.map(suggestion => (
                <li key={suggestion}>
                  <Button
                    onClick={() => onSend(suggestion)}
                    shape="round"
                    size="sm"
                    variant="outline"
                  >
                    {suggestion}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6" ref={scroller}>
        <ChatMessageList aria-label="Conversation" className={column} tabIndex={0}>
          {messages.map(message =>
            message.from === 'user' ? (
              <ChatMessage from="user" key={message.id}>
                {message.text}
              </ChatMessage>
            ) : (
              <Reply key={message.id} message={message} onFeedback={onFeedback} />
            )
          )}
        </ChatMessageList>
      </div>
      <div className="px-4 pb-4">
        <div className={column}>{composer}</div>
      </div>
    </div>
  )
}

export interface ChatPanelProps extends ChatThreadProps {
  /** Closes the panel; the close button is drawn only when it is given. */
  onClose?: () => void
  /** Starts a new conversation; the button is drawn only when it is given. */
  onNewChat?: () => void
  /** The panel's heading and the name of its region. */
  title?: string
}

/*
 * A side panel next to the product. The layout places it and sets its width
 * (about 24rem beside the page, or a Sheet on phones); it fills its height and
 * the transcript scrolls inside it.
 */
export function ChatPanel({ onClose, onNewChat, title = 'Assistant', ...thread }: ChatPanelProps) {
  return (
    <section
      aria-label={title}
      className="bg-background text-foreground flex h-full min-h-0 flex-col"
    >
      <header className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <Sparkles aria-hidden className="text-muted-foreground size-4" />
        <h2 className="text-foreground text-sm font-semibold">{title}</h2>
        <div className="ms-auto flex items-center gap-1">
          {onNewChat ? (
            <Button aria-label="New chat" onClick={onNewChat} size="icon-sm" variant="ghost">
              <SquarePen aria-hidden />
            </Button>
          ) : null}
          {onClose ? (
            <Button aria-label="Close assistant" onClick={onClose} size="icon-sm" variant="ghost">
              <X aria-hidden />
            </Button>
          ) : null}
        </div>
      </header>
      <ChatThread {...thread} />
    </section>
  )
}
