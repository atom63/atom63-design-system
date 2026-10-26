import type * as React from 'react'

import { cn } from '../../lib/cn'

export type ChatTypingIndicatorProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** What a screen reader announces. Defaults to "Assistant is typing". */
  label?: string
}

/*
 * Three dots while the assistant prepares its reply, before its first text
 * arrives; replace it with the ChatMessage then. It is a polite `status`
 * region named by `label`, so a screen reader announces it once without
 * interrupting. The dots are decoration. With reduced motion they hold still.
 */
export function ChatTypingIndicator({
  className,
  label = 'Assistant is typing',
  ...props
}: ChatTypingIndicatorProps): React.ReactElement {
  return (
    <span
      aria-label={label}
      className={cn('a63-ChatTypingIndicator', className)}
      data-slot="chat-typing-indicator"
      role="status"
      {...props}
    >
      {[0, 1, 2].map(index => (
        <span
          aria-hidden="true"
          className="a63-ChatTypingIndicator-dot"
          data-slot="chat-typing-indicator-dot"
          key={index}
        />
      ))}
    </span>
  )
}
