import { type WidgetSize, WidgetGrid, widgetTypeStyle, WidgetViewport } from '@atom63/widgets'
import {
  WidgetCard,
  WidgetCardContent,
  WidgetCardHeader,
  WidgetCardHeaderLeft,
  WidgetCardTitle,
} from '@atom63/widgets/primitives'
import { SectionHeader } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'
import { BriefcaseBusiness, Clock, PenLine } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

import { resume } from '../../content/resume'
import { formatDate, posts } from '../../content/writing'
import { portfolio } from '../../portfolio.config'

const fill = { blockSize: '100%', inlineSize: '100%' }
const muted = { color: 'var(--a63-text-secondary)', margin: 0 }

function Tile({
  children,
  icon,
  size,
  title,
}: {
  children: ReactNode
  icon: ReactNode
  size: WidgetSize
  title: string
}) {
  return (
    <WidgetViewport size={size}>
      <WidgetCard size={size} style={fill}>
        <WidgetCardHeader>
          <WidgetCardHeaderLeft>
            <WidgetCardTitle icon={icon}>{title}</WidgetCardTitle>
          </WidgetCardHeaderLeft>
        </WidgetCardHeader>
        <WidgetCardContent style={{ flex: 1, justifyContent: 'flex-end' }}>
          {children}
        </WidgetCardContent>
      </WidgetCard>
    </WidgetViewport>
  )
}

function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

/* Four tracks on a wide screen, two on a phone; widget tracks are fixed, not fluid. */
function useColumns(): number {
  const query = '(min-width: 48rem)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return wide ? 4 : 2
}

/**
 * A board of small widgets built on @atom63/widgets: the time where you are,
 * what you do now and your latest post. Add a tile by composing a WidgetCard.
 */
export function WidgetBoard() {
  const now = useNow(30_000)
  const columns = useColumns()
  const current = resume.experience.find(role => role.end === null)
  const latest = posts[0]

  return (
    <div className="grid gap-6">
      <SectionHeader level={2} title="Right now" variant="secondary" />
      <WidgetGrid columns={columns} gap={12}>
        <Tile icon={<Clock aria-hidden />} size="small" title="Local time">
          <span style={widgetTypeStyle('display', 'small')}>
            {now.toLocaleTimeString('en', {
              hour: '2-digit',
              hourCycle: 'h23',
              minute: '2-digit',
              timeZone: portfolio.person.timeZone,
            })}
          </span>
          <span style={{ ...muted, ...widgetTypeStyle('label', 'small') }}>
            {portfolio.person.location.split(',')[0]}
          </span>
        </Tile>
        <Tile icon={<BriefcaseBusiness aria-hidden />} size="small" title="Now">
          <span style={widgetTypeStyle('headline', 'small')}>
            {current?.company ?? 'Open to work'}
          </span>
          <span style={{ ...muted, ...widgetTypeStyle('label', 'small') }}>{current?.title}</span>
        </Tile>
        {latest ? (
          <Tile icon={<PenLine aria-hidden />} size="medium" title="Latest writing">
            <Link
              className="text-foreground hover:underline"
              params={{ slug: latest.slug }}
              style={widgetTypeStyle('headline', 'medium')}
              to="/writing/$slug"
            >
              {latest.title}
            </Link>
            <span style={{ ...muted, ...widgetTypeStyle('label', 'medium') }}>
              {formatDate(latest.date)}
            </span>
          </Tile>
        ) : null}
      </WidgetGrid>
    </div>
  )
}
