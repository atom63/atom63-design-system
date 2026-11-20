'use client'

import * as React from 'react'

import { cn } from '../../lib/cn'

export type ChatTypingIndicatorProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** What a screen reader announces. Defaults to "Assistant is typing". */
  label?: string
}

/*
 * Three dots while the assistant prepares its reply, before its first text
 * arrives; replace it with the ChatMessage then. It is a polite `status`
 * region that mounts empty and then takes `label` as visually hidden text, so
 * a screen reader hears the change without being interrupted. A streaming
 * ChatMessage that holds it leaves off `aria-busy`, which would hold that
 * announcement back. The dots are decoration. With reduced motion they hold
 * still.
 */
export function ChatTypingIndicator({
  className,
  label = 'Assistant is typing',
  ...props
}: ChatTypingIndicatorProps): React.ReactElement {
  const [announced, setAnnounced] = React.useState(false)
  React.useEffect(() => {
    // After the empty region is in the accessibility tree, not with it.
    const timer = setTimeout(() => setAnnounced(true), 100)
    return () => clearTimeout(timer)
  }, [])
  return (
    <span
      className={cn('a63-ChatTypingIndicator', className)}
      data-slot="chat-typing-indicator"
      role="status"
      {...props}
    >
      <span className="a63-ChatTypingIndicator-label">{announced ? label : null}</span>
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
