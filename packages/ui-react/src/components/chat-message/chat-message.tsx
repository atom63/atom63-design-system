import {
  type ChatMessageAppearance,
  type ChatMessageRole,
  chatMessageContract,
} from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type ChatMessageListProps = React.ComponentProps<'div'>

/*
 * The transcript of a conversation: a `log` region, so a screen reader reads
 * each new turn as it arrives without moving focus. Give it a name with
 * `aria-label` ("Conversation"). It only stacks the turns; the surface that
 * holds it owns scrolling.
 */
export function ChatMessageList({ className, ...props }: ChatMessageListProps): React.ReactElement {
  return (
    <div
      className={cn('a63-ChatMessageList', className)}
      data-slot="chat-message-list"
      role="log"
      {...props}
    />
  )
}

export type ChatMessageProps = React.ComponentProps<'article'> & {
  /** Who wrote the message: the conversation role, such as `message.role` from `@atom63/agent`. */
  from: ChatMessageRole
  /** Buttons under the message, such as copy, retry and feedback. */
  actions?: React.ReactNode
  /** Draws the assistant's message as plain text (the default) or in a bubble. The user's message is always a bubble. */
  appearance?: ChatMessageAppearance
  /** An Avatar beside the message. */
  avatar?: React.ReactNode
  /**
   * The accessible name of the message, so a screen reader says who is
   * speaking. Defaults to "You" for the user and "Assistant" for the assistant.
   */
  label?: string
  /** Marks a reply that is still arriving (`aria-busy`), so assistive technology waits for the whole text. */
  streaming?: boolean
}

const DEFAULT_LABELS: Record<ChatMessageRole, string> = { assistant: 'Assistant', user: 'You' }

/*
 * One turn of a conversation. The user's turn is a tinted bubble on the
 * trailing side; the assistant's is plain text across the column, or a bubble
 * with `appearance="bubble"`. Content is the host's: plain text, or markdown
 * the host renders. ChatMessage does not fetch, stream or parse anything;
 * `@atom63/agent` or another runtime supplies the turns.
 */
export function ChatMessage({
  actions,
  appearance = chatMessageContract.defaultAppearance,
  avatar,
  children,
  className,
  from,
  label,
  streaming = false,
  ...props
}: ChatMessageProps): React.ReactElement {
  return (
    <article
      aria-busy={streaming || undefined}
      aria-label={label ?? DEFAULT_LABELS[from]}
      className={cn('a63-ChatMessage', className)}
      data-appearance={from === 'user' ? 'bubble' : appearance}
      data-role={from}
      data-slot="chat-message"
      data-streaming={streaming ? '' : undefined}
      {...props}
    >
      {avatar ? (
        <div className="a63-ChatMessage-avatar" data-slot="chat-message-avatar">
          {avatar}
        </div>
      ) : null}
      <div className="a63-ChatMessage-body" data-slot="chat-message-body">
        <div className="a63-ChatMessage-content" data-slot="chat-message-content">
          {children}
        </div>
        {actions ? (
          <div className="a63-ChatMessage-actions" data-slot="chat-message-actions">
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  )
}
