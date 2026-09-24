import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import {
  SequenceBlock,
  SequenceBody,
  SequenceSpine,
} from '../../foundations/sequence/sequence-block'

export type TimelineProps = {
  children: ReactNode
  className?: string
}

export type TimelineItemProps = {
  /** Date or label shown in the left column (e.g. a year). */
  date: ReactNode
  /** Bold heading for the event. */
  title: ReactNode
  children: ReactNode
  className?: string
}

/**
 * A single timeline event: date/label (left), a spine with a dot marker
 * (center), and the event card — title plus content (right). Static/SSR-safe.
 */
function TimelineItem({ date, title, children, className }: TimelineItemProps) {
  return (
    <li
      className={clsx(
        'group relative grid grid-cols-[auto_1.25rem_1fr] gap-x-3 sm:grid-cols-[6rem_1.25rem_1fr] sm:gap-x-4',
        className
      )}
    >
      <div className="mdx-timeline-date pt-0.5 font-mono text-xs tracking-wider uppercase tabular-nums sm:text-sm">
        {date}
      </div>
      <div className="flex flex-col items-center">
        <span
          className="mdx-timeline-dot z-10 mt-1 size-3 shrink-0 rounded-full border-2"
          data-testid="timeline-item-dot"
        />
        <SequenceSpine />
      </div>
      <SequenceBody title={title}>{children}</SequenceBody>
    </li>
  )
}

/**
 * MDX `Timeline` block — a vertical event timeline. Wraps `Timeline.Item`
 * children in an ordered list with a date column, a dotted spine, and an event
 * card per item. Static/SSR-safe (no client interactivity or motion).
 */
function Timeline({ children, className }: TimelineProps) {
  return <SequenceBlock className={className}>{children}</SequenceBlock>
}

Timeline.Item = TimelineItem

export { Timeline }
