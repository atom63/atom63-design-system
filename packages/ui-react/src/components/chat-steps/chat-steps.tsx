'use client'

import type { ChatStepStatus } from '@atom63/ui-foundation'
import { CircleCheck, CircleDashed, CircleX } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  type CollapsibleProps,
  CollapsibleTrigger,
} from '../collapsible'
import { Spinner } from '../spinner'

export type ChatStepsProps = Omit<CollapsibleProps, 'children' | 'className'> & {
  /** The steps: ChatStep elements. */
  children?: React.ReactNode
  className?: string
  /** An icon before the label, such as a sparkle or a wrench. */
  icon?: React.ReactNode
  /** The trigger text: "Thinking", "Used 3 tools", "Thought for 12 seconds". */
  label: React.ReactNode
}

/*
 * The tool calls and thinking behind an assistant reply, folded under one
 * trigger. Open it while steps run and let it close when the answer arrives;
 * the reader can open it again. Built on Collapsible, so the trigger is a
 * button with aria-expanded and the list is an ordered list.
 */
export function ChatSteps({
  children,
  className,
  icon,
  label,
  ...props
}: ChatStepsProps): React.ReactElement {
  return (
    <Collapsible className={cn('a63-ChatSteps', className)} data-slot="chat-steps" {...props}>
      <CollapsibleTrigger className="a63-ChatSteps-trigger" data-slot="chat-steps-trigger">
        {icon ? (
          <span aria-hidden="true" className="a63-ChatSteps-icon">
            {icon}
          </span>
        ) : null}
        <span className="a63-ChatSteps-label">{label}</span>
        <CollapsibleIndicator />
      </CollapsibleTrigger>
      <CollapsibleContent className="a63-ChatSteps-content" data-slot="chat-steps-content">
        <ol className="a63-ChatSteps-list">{children}</ol>
      </CollapsibleContent>
    </Collapsible>
  )
}

export type ChatStepProps = Omit<React.ComponentProps<'li'>, 'title'> & {
  /** A line under the step, such as the query a tool ran or its result. */
  description?: React.ReactNode
  /** Replaces the status icon. */
  icon?: React.ReactNode
  /** Where the step is. Defaults to complete. */
  status?: ChatStepStatus
  /** The status read to screen readers before the step. Defaults to the English status name. */
  statusLabel?: string
}

const STATUS_LABELS: Record<ChatStepStatus, string> = {
  complete: 'Done',
  error: 'Failed',
  pending: 'Pending',
  running: 'Running',
}

const STATUS_ICONS: Record<ChatStepStatus, React.ReactNode> = {
  complete: <CircleCheck aria-hidden />,
  error: <CircleX aria-hidden />,
  pending: <CircleDashed aria-hidden />,
  running: <Spinner aria-hidden aria-label={undefined} role={undefined} />,
}

/*
 * One step: a status icon, the step's title and an optional description. The
 * icon is decoration; the status is also text for screen readers, so it never
 * depends on color or shape alone.
 */
export function ChatStep({
  children,
  className,
  description,
  icon,
  status = 'complete',
  statusLabel,
  ...props
}: ChatStepProps): React.ReactElement {
  return (
    <li
      className={cn('a63-ChatStep', className)}
      data-slot="chat-step"
      data-status={status}
      {...props}
    >
      <span aria-hidden="true" className="a63-ChatStep-icon" data-slot="chat-step-icon">
        {icon ?? STATUS_ICONS[status]}
      </span>
      <span className="a63-ChatStep-body">
        <span className="a63-ChatStep-title">
          <span className="a63-ChatStep-sr-only">{`${statusLabel ?? STATUS_LABELS[status]}: `}</span>
          {children}
        </span>
        {description ? (
          <span className="a63-ChatStep-description" data-slot="chat-step-description">
            {description}
          </span>
        ) : null}
      </span>
    </li>
  )
}
