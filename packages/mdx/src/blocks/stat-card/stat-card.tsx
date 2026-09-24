import { Card, CardContent as CardPanel } from '@atom63/ui-react'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type StatTrend = 'up' | 'down' | 'neutral'

export type StatCardProps = {
  /** Small muted caption above the value. */
  label: string
  /** The prominent metric. */
  value: ReactNode
  /** Optional secondary change indicator, colored by `trend`. */
  change?: ReactNode
  /** Semantic direction of `change`; drives the token color. */
  trend?: StatTrend
  className?: string
}

const trendClassName: Record<StatTrend, string> = {
  up: 'mdx-stat-card-change-up',
  down: 'mdx-stat-card-change-down',
  neutral: 'mdx-stat-card-change-neutral',
}

/**
 * MDX `StatCard` block — a static, SSR-safe metric card built on the
 * `@atom63/ui-react` `Card`. Renders a muted label, a prominent value, and an
 * optional change indicator colored by `trend` using semantic tokens.
 */
function StatCard({ label, value, change, trend = 'neutral', className }: StatCardProps) {
  return (
    <Card className={clsx('mdx-stat-card not-mdx', className)}>
      <CardPanel className="flex flex-col gap-1">
        <p className="mdx-stat-card-label text-sm font-medium">{label}</p>
        <p className="mdx-stat-card-value text-2xl leading-tight font-semibold tabular-nums">
          {value}
        </p>
        {change != null ? (
          <p
            className={clsx('mdx-stat-card-change text-sm font-medium', trendClassName[trend])}
            data-testid="stat-card-change"
          >
            {change}
          </p>
        ) : null}
      </CardPanel>
    </Card>
  )
}

export { StatCard }
