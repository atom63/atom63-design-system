import { Badge, Card, CardContent, Skeleton } from '@atom63/ui-react'

export const template = {
  id: 'stat-row',
  kind: 'block',
  title: 'Stat row',
  description:
    'A row of headline numbers, each with its label and an optional change against the previous period that does not rely on color alone, with placeholder cards while they load.',
  category: 'data',
  tags: ['stats', 'metrics', 'kpi', 'dashboard', 'numbers', 'summary', 'loading'],
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
  /**
   * Shows placeholder cards while the numbers load: one per stat, or four
   * without stats. The row is announced once, by `loadingLabel`.
   */
  loading?: boolean
  /** Names the row while it loads; "Loading metrics" by default. */
  loadingLabel?: string
  stats: readonly Stat[]
}

/*
 * As many columns as fit at 10rem or wider, so three, four or five stats fill
 * the row: two on a phone, up to the stat count on a wide screen. Each stat
 * is its own term and value pair, so a screen reader reads "Revenue,
 * $48,200". A long value wraps inside its card rather than spilling out. The
 * card's content slot gives it the same inset as other cards.
 */
const grid = 'grid grid-cols-[repeat(auto-fit,minmax(min(10rem,100%),1fr))] gap-4'

export function StatRow({
  comparison,
  loading = false,
  loadingLabel = 'Loading metrics',
  stats,
}: StatRowProps) {
  if (loading) {
    // The wrapper is announced once as busy; the placeholders are decorative.
    return (
      <div aria-busy="true" aria-label={loadingLabel} className={grid} role="status">
        {Array.from({ length: stats.length || 4 }, (_, index) => (
          <Card key={index} padding="none">
            <CardContent className="flex flex-col gap-3" padding="md">
              <Skeleton className="h-4 w-20 max-w-full rounded-sm" />
              <Skeleton className="h-7 w-28 max-w-full rounded-sm" />
              <Skeleton className="h-4 w-24 max-w-full rounded-sm" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  return (
    <div className={grid}>
      {stats.map((stat, index) => (
        // Labels can repeat, so the key is the position.
        <Card className="min-w-0" key={index} padding="none">
          <CardContent padding="md">
            <dl className="flex min-w-0 flex-col gap-2">
              <dt className="text-muted-foreground text-sm">{stat.label}</dt>
              <dd className="font-heading text-foreground text-2xl font-semibold [overflow-wrap:anywhere] tabular-nums">
                {stat.value}
              </dd>
              {stat.change ? (
                <dd className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
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
