import { Badge, Card, CardContent } from '@atom63/ui-react'

export const template = {
  id: 'stat-row',
  kind: 'block',
  title: 'Stat row',
  description:
    'A row of headline numbers, each with its label and an optional change against the previous period that does not rely on color alone.',
  category: 'data',
  tags: ['stats', 'metrics', 'kpi', 'dashboard', 'numbers', 'summary'],
  readiness: 'ready',
} as const

export interface Stat {
  /** Compared with the previous period, for example { direction: 'up', text: '12%', tone: 'good' }. */
  change?: { direction: 'up' | 'down'; text: string; tone: 'good' | 'bad' }
  label: string
  value: string
}

export interface StatRowProps {
  /** Names the period for the change badges, for example "vs. last month". */
  comparison?: string
  stats: readonly Stat[]
}

/*
 * Two columns on a phone, four from `lg`. Each stat is its own term and
 * value pair, so a screen reader reads "Revenue, $48,200". The card's content
 * slot gives it the same inset as other cards.
 */
export function StatRow({ comparison, stats }: StatRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(stat => (
        <Card key={stat.label} padding="none">
          <CardContent padding="md">
            <dl className="flex flex-col gap-2">
              <dt className="text-muted-foreground text-sm">{stat.label}</dt>
              <dd className="font-heading text-foreground text-2xl font-semibold tabular-nums">
                {stat.value}
              </dd>
              {stat.change ? (
                <dd className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Badge size="sm" variant={stat.change.tone === 'good' ? 'success' : 'error'}>
                    <span aria-hidden>{stat.change.direction === 'up' ? '↑' : '↓'}</span>
                    {stat.change.text}
                  </Badge>
                  {comparison}
                </dd>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
