import {
  ActivityList,
  type DataTableColumn,
  DataTableSection,
  EmptyState,
  PageHeader,
  type Stat,
  StatRow,
} from '@atom63/templates'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  SegmentedControl,
} from '@atom63/ui-react'
import { Container, SectionHeader } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'
import { ChartNoAxesCombined } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { AreaChart, BarChart, type ChartSeries, Legend, ShareBar } from '../components/charts'
import { LoadError, LoadingBlock, LoadingStats } from '../components/states'
import {
  type Account,
  activity,
  compactCurrency,
  currency,
  months,
  type Plan,
  planLabel,
  plans,
} from '../data'
import { useAccounts, useDataState } from '../store'

const periods = [
  { label: '3 months', value: '3' },
  { label: '6 months', value: '6' },
  { label: '12 months', value: '12' },
]

const planSeries: Record<Plan, ChartSeries> = { enterprise: 1, growth: 2, scale: 3, starter: 5 }
const percent = (value: number) => `${(value * 100).toFixed(1)}%`

function change(now: number, before: number, goodWhenUp = true): Stat['change'] {
  const ratio = before === 0 ? 0 : (now - before) / before
  const direction = ratio >= 0 ? 'up' : 'down'
  return {
    direction,
    text: percent(Math.abs(ratio)),
    tone: (direction === 'up') === goodWhenUp ? 'good' : 'bad',
  }
}

function ChartCard({
  children,
  description,
  legend,
  title,
}: {
  children: ReactNode
  description: string
  legend?: ReactNode
  title: string
}) {
  return (
    <Card padding="none">
      <CardContent className="flex flex-col gap-4" padding="md">
        <div className="flex flex-col gap-1">
          <CardTitle render={<h2 />}>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {legend}
        {children}
      </CardContent>
    </Card>
  )
}

const accountColumns: readonly DataTableColumn<Account>[] = [
  {
    cell: account => (
      <Link
        className="text-foreground font-medium underline-offset-4 hover:underline"
        search={{ account: account.id }}
        to="/accounts"
      >
        {account.name}
      </Link>
    ),
    header: 'Account',
    key: 'name',
  },
  {
    cell: account => <Badge variant="outline">{planLabel(account.plan)}</Badge>,
    header: 'Plan',
    key: 'plan',
  },
  { align: 'end', cell: account => currency.format(account.mrr), header: 'MRR', key: 'mrr' },
]

export function OverviewPage() {
  const state = useDataState()
  const { accounts } = useAccounts()
  const [period, setPeriod] = useState('6')

  const range = months.slice(-Number(period))
  const first = range[0]!
  const last = range.at(-1)!
  const churned = range.reduce((sum, month) => sum + month.churnedMrr, 0)
  const netNew = range.reduce((sum, month) => sum + month.newMrr - month.churnedMrr, 0)
  const stats: readonly Stat[] = [
    { change: change(last.mrr, first.mrr), label: 'MRR', value: currency.format(last.mrr) },
    {
      change: change(last.activeAccounts, first.activeAccounts),
      label: 'Paying accounts',
      value: String(last.activeAccounts),
    },
    { label: 'Net new MRR', value: currency.format(netNew) },
    {
      label: 'Revenue churn',
      value: percent(churned / range.reduce((sum, month) => sum + month.mrr, 0)),
    },
  ]

  const byPlan = plans.map(plan => ({
    label: plan.label,
    series: planSeries[plan.value],
    value: accounts
      .filter(account => account.plan === plan.value)
      .reduce((sum, account) => sum + account.mrr, 0),
  }))
  const top = [...accounts].sort((a, b) => b.mrr - a.mrr).slice(0, 5)

  const periodControl = (
    <SegmentedControl
      aria-label="Period"
      items={periods}
      onValueChange={setPeriod}
      size="sm"
      value={period}
    />
  )

  let body: ReactNode
  if (state === 'error') {
    body = <LoadError what="your metrics" />
  } else if (state === 'empty') {
    body = (
      <EmptyState
        action={
          <Button render={<Link to="/settings" />} variant="primary">
            Connect billing
          </Button>
        }
        description="Tidepool fills this page once it can read your billing provider. It takes about a minute."
        icon={<ChartNoAxesCombined aria-hidden />}
        title="No revenue data yet"
      />
    )
  } else if (state === 'loading') {
    body = (
      <>
        <LoadingStats />
        <div className="grid gap-6 lg:grid-cols-2">
          <LoadingBlock label="Loading the revenue chart" rows={4} />
          <LoadingBlock label="Loading the movement chart" rows={4} />
        </div>
      </>
    )
  } else {
    body = (
      <>
        <StatRow comparison={`vs. ${first.label}`} stats={stats} />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard description="Monthly recurring revenue at the end of each month." title="MRR">
            <AreaChart
              caption="MRR by month"
              format={currency.format}
              formatTick={compactCurrency.format}
              points={range.map(month => ({ label: month.label, value: month.mrr }))}
            />
          </ChartCard>
          <ChartCard
            description="Revenue won from new and expanding accounts, and lost to churn."
            legend={
              <Legend
                items={[
                  { label: 'New', series: 2 },
                  { label: 'Churned', series: 5 },
                ]}
              />
            }
            title="MRR movement"
          >
            <BarChart
              caption="New and churned MRR by month"
              format={currency.format}
              formatTick={compactCurrency.format}
              groups={range.map(month => ({
                label: month.label,
                values: [month.newMrr, month.churnedMrr],
              }))}
              series={[
                { label: 'New', series: 2 },
                { label: 'Churned', series: 5 },
              ]}
            />
          </ChartCard>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="flex flex-col gap-4">
            <SectionHeader level={2} title="Top accounts" variant="muted" />
            <DataTableSection
              columns={accountColumns}
              empty={{ description: 'Accounts appear here once they pay.', title: 'No accounts' }}
              getRowKey={account => account.id}
              headingLevel={3}
              label="Top accounts by MRR"
              rows={top}
              summary={`The ${top.length} largest of ${accounts.length} accounts`}
            />
          </section>
          <div className="flex flex-col gap-6">
            <ChartCard description="Current MRR by plan." title="Plan mix">
              <ShareBar caption="MRR by plan" format={currency.format} parts={byPlan} />
            </ChartCard>
            <section className="flex flex-col gap-4">
              <SectionHeader level={2} title="Activity" variant="muted" />
              <ActivityList items={activity} label="Recent account activity" />
            </section>
          </div>
        </div>
      </>
    )
  }

  return (
    <Container className="flex flex-col gap-8" maxWidth="wide" padding="none">
      <PageHeader
        actions={state === 'ready' ? periodControl : undefined}
        description="Revenue and accounts for Tidepool's workspace, November 2026."
        title="Overview"
      />
      {body}
    </Container>
  )
}
