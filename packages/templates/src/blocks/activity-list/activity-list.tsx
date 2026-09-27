import { Avatar, AvatarFallback } from '@atom63/ui-react'

export const template = {
  id: 'activity-list',
  kind: 'block',
  title: 'Activity list',
  description:
    'Recent events in time order: who did what to which item, and when, with a machine-readable time for each entry.',
  category: 'data',
  tags: ['activity', 'feed', 'timeline', 'history', 'audit log', 'recent'],
  readiness: 'draft',
} as const

export interface ActivityItem {
  /** Who acted, as a display name; the avatar shows its initials. */
  actor: string
  /** What happened, completing "<actor> …", for example "paid invoice". */
  action: string
  /** ISO date and time, for the `<time>` element. */
  dateTime: string
  id: string
  target: string
  /** The time as people read it, for example "2 hours ago". */
  time: string
}

export interface ActivityListProps {
  items: readonly ActivityItem[]
  /** Names the list for assistive technology. */
  label: string
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')

export function ActivityList({ items, label }: ActivityListProps) {
  return (
    <ol aria-label={label} className="flex flex-col gap-4">
      {items.map(item => (
        <li className="flex items-start gap-3" key={item.id}>
          <Avatar size="sm">
            <AvatarFallback>{initials(item.actor)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
            <p className="text-foreground">
              <span className="font-medium">{item.actor}</span> {item.action}{' '}
              <span className="font-medium">{item.target}</span>
            </p>
            <time className="text-muted-foreground text-xs" dateTime={item.dateTime}>
              {item.time}
            </time>
          </div>
        </li>
      ))}
    </ol>
  )
}
