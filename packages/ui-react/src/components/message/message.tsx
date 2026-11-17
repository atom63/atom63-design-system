import {
  type MessageDeliveryState,
  type MessageDirection,
  type MessagePosition,
  messageContract,
} from '@atom63/ui-foundation'
import { AlertCircle, Check, CheckCheck, Clock } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type MessageListProps = React.ComponentProps<'div'>

/*
 * A thread between people: a `log` region, so a screen reader reads each new
 * message as it arrives without moving focus. Give it a name with
 * `aria-label` ("Messages with Ada"). It only stacks the messages; the surface
 * that holds it owns scrolling. For an AI assistant's conversation, use
 * ChatMessageList and ChatMessage.
 */
export function MessageList({ className, ...props }: MessageListProps): React.ReactElement {
  return (
    <div
      className={cn('a63-MessageList', className)}
      data-slot="message-list"
      role="log"
      {...props}
    />
  )
}

const STATUS: Record<MessageDeliveryState, { icon: React.ElementType; label: string }> = {
  sending: { icon: Clock, label: 'Sending' },
  sent: { icon: Check, label: 'Sent' },
  delivered: { icon: CheckCheck, label: 'Delivered' },
  read: { icon: CheckCheck, label: 'Read' },
  failed: { icon: AlertCircle, label: 'Not delivered' },
}

export type MessageProps = Omit<React.ComponentProps<'article'>, 'children'> & {
  /** The message text. */
  children?: React.ReactNode
  /** `incoming` (the default): from someone else, on the leading side. `outgoing`: from you, on the trailing side. */
  direction?: MessageDirection
  /**
   * Where the message sits in a run of consecutive messages from one sender.
   * `single` (the default) and `last` draw the tail and show the avatar;
   * `first` and `middle` join the next message.
   */
  position?: MessagePosition
  /** The sender's name, which names the message for assistive technology. */
  label: string
  /** An Avatar for an incoming message. Pass it on every message of the run: it shows on the last one and keeps the column on the others. */
  avatar?: React.ReactNode
  /** A photo or other media above the text, drawn with the bubble's corners. */
  media?: React.ReactNode
  /** When it was sent, as shown (`12:04`). */
  time?: React.ReactNode
  /** The delivery status of an outgoing message. */
  status?: MessageDeliveryState
  /** Labels for the delivery statuses, to translate them. */
  statusLabels?: Partial<Record<MessageDeliveryState, string>>
}

/*
 * One message between people, as a bubble on its sender's side. Content is
 * the host's: plain text, a link, or an emoji. Message does not fetch, send or
 * group anything; the host passes `position` from its own run grouping.
 */
export function Message({
  avatar,
  children,
  className,
  direction = messageContract.defaultDirection,
  label,
  media,
  position = messageContract.defaultPosition,
  status,
  statusLabels,
  time,
  ...props
}: MessageProps): React.ReactElement {
  const Status = status ? STATUS[status].icon : null
  const statusLabel = status ? (statusLabels?.[status] ?? STATUS[status].label) : null
  return (
    <article
      aria-label={label}
      className={cn('a63-Message', className)}
      data-direction={direction}
      data-media={media ? '' : undefined}
      data-position={position}
      data-slot="message"
      {...props}
    >
      {avatar && direction === 'incoming' ? (
        <div className="a63-Message-avatar" data-slot="message-avatar">
          {avatar}
        </div>
      ) : null}
      <div className="a63-Message-bubble" data-slot="message-bubble">
        {media ? (
          <div className="a63-Message-media" data-slot="message-media">
            {media}
          </div>
        ) : null}
        {children || time || status ? (
          <div className="a63-Message-content" data-slot="message-content">
            {children}
            {time || status ? (
              <span className="a63-Message-meta" data-slot="message-meta">
                {time}
                {Status ? (
                  <span
                    className="a63-Message-status"
                    data-slot="message-status"
                    data-status={status}
                    role="img"
                    aria-label={statusLabel ?? undefined}
                  >
                    <Status aria-hidden />
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export type MessageEventProps = React.ComponentProps<'div'> & {
  /** An icon before the text, such as a phone for a call. */
  icon?: React.ReactNode
}

/* A centred row for what is not a message in a thread: a call, a date, someone joining. */
export function MessageEvent({
  children,
  className,
  icon,
  ...props
}: MessageEventProps): React.ReactElement {
  return (
    <div className={cn('a63-MessageEvent', className)} data-slot="message-event" {...props}>
      {icon ? (
        <span aria-hidden className="a63-MessageEvent-icon">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </div>
  )
}
