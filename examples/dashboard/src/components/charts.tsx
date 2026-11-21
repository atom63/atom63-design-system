import type { ReactNode } from 'react'

/*
 * Small SVG charts. The system has chart colour tokens (--a63-chart-1 … 5)
 * but no chart component, so these draw only the marks in SVG and leave the
 * axis labels, legend and data table to HTML, where text keeps its size on a
 * phone. Each chart carries a visually hidden table with the same numbers.
 *
 * Series colours: 1 is the brand (here violet), 2 teal, 3 amber, 5 rose.
 * Series 4 is a fixed violet, which collides with the violet brand, so this
 * app does not use it.
 */
export type ChartSeries = 1 | 2 | 3 | 5

export const seriesColor = (series: ChartSeries) => `var(--a63-chart-${series})`

export function LegendSwatch({ series }: { series: ChartSeries }) {
  return (
    <span
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: seriesColor(series) }}
    />
  )
}

export function Legend({ items }: { items: readonly { label: string; series: ChartSeries }[] }) {
  return (
    <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {items.map(item => (
        <li className="flex items-center gap-1.5" key={item.label}>
          <LegendSwatch series={item.series} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/* Rounds the top of the axis up to a tidy number, so the middle tick is one
   too: 9,400 → 10,000, 109,900 → 150,000. */
function niceMax(value: number) {
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = value / magnitude > 5 ? magnitude : magnitude / 2
  return Math.ceil(value / step) * step
}

interface AxisFrameProps {
  children: ReactNode
  labels: readonly string[]
  max: number
  formatTick: (value: number) => string
}

/* The y-axis ticks, the plot and the x-axis labels. On a phone only every
   other x label shows, so twelve months still fit. */
function AxisFrame({ children, formatTick, labels, max }: AxisFrameProps) {
  const ticks = [max, max / 2, 0]
  return (
    <div aria-hidden className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
      <div className="text-muted-foreground flex h-48 flex-col justify-between text-end text-xs tabular-nums">
        {ticks.map(tick => (
          <span className="-my-2" key={tick}>
            {formatTick(tick)}
          </span>
        ))}
      </div>
      <div className="relative h-48">
        <svg
          className="absolute inset-0 size-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {[0, 50, 100].map(y => (
            <line
              key={y}
              stroke="var(--a63-border-subtle)"
              vectorEffect="non-scaling-stroke"
              x1="0"
              x2="100"
              y1={y}
              y2={y}
            />
          ))}
          {children}
        </svg>
      </div>
      <span />
      <div className="text-muted-foreground mt-2 flex justify-between text-xs">
        {labels.map((label, index) => (
          <span className={index % 2 === 1 ? 'max-sm:invisible' : undefined} key={label}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

interface DataTableProps {
  caption: string
  columns: readonly string[]
  rows: readonly (readonly string[])[]
}

function HiddenTable({ caption, columns, rows }: DataTableProps) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row[0]}>
            {row.map((cell, index) =>
              index === 0 ? (
                <th key={index} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={index}>{cell}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export interface AreaChartProps {
  caption: string
  format: (value: number) => string
  formatTick: (value: number) => string
  points: readonly { label: string; value: number }[]
  series?: ChartSeries
}

/* One series over time, as a line with a light fill under it. */
export function AreaChart({ caption, format, formatTick, points, series = 1 }: AreaChartProps) {
  const max = niceMax(Math.max(...points.map(point => point.value)))
  const step = 100 / Math.max(1, points.length - 1)
  const coords = points.map((point, index) => [index * step, 100 - (point.value / max) * 100])
  const line = coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const color = seriesColor(series)
  return (
    <figure className="m-0">
      <AxisFrame formatTick={formatTick} labels={points.map(point => point.label)} max={max}>
        <path d={`${line} L100,100 L0,100 Z`} fill={color} fillOpacity={0.12} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </AxisFrame>
      <HiddenTable
        caption={caption}
        columns={['Month', 'Value']}
        rows={points.map(point => [point.label, format(point.value)])}
      />
    </figure>
  )
}

export interface BarChartProps {
  caption: string
  format: (value: number) => string
  formatTick: (value: number) => string
  groups: readonly { label: string; values: readonly number[] }[]
  series: readonly { label: string; series: ChartSeries }[]
}

/* Grouped bars, one bar per series in each group. */
export function BarChart({ caption, format, formatTick, groups, series }: BarChartProps) {
  const max = niceMax(Math.max(...groups.flatMap(group => group.values)))
  const slot = 100 / groups.length
  const barWidth = (slot * 0.64) / series.length
  return (
    <figure className="m-0">
      <AxisFrame formatTick={formatTick} labels={groups.map(group => group.label)} max={max}>
        {groups.map((group, groupIndex) =>
          group.values.map((value, seriesIndex) => {
            const height = (value / max) * 100
            return (
              <rect
                fill={seriesColor(series[seriesIndex]!.series)}
                height={height}
                key={`${group.label}-${seriesIndex}`}
                width={barWidth}
                x={groupIndex * slot + slot * 0.18 + seriesIndex * barWidth}
                y={100 - height}
              />
            )
          })
        )}
      </AxisFrame>
      <HiddenTable
        caption={caption}
        columns={['Month', ...series.map(item => item.label)]}
        rows={groups.map(group => [group.label, ...group.values.map(format)])}
      />
    </figure>
  )
}

export interface ShareBarProps {
  caption: string
  format: (value: number) => string
  parts: readonly { label: string; series: ChartSeries; value: number }[]
}

/* Parts of a whole as one stacked bar, with the numbers listed under it. */
export function ShareBar({ caption, format, parts }: ShareBarProps) {
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1
  return (
    <figure className="m-0 flex flex-col gap-4">
      <div aria-hidden className="bg-muted flex h-3 overflow-hidden rounded-full">
        {parts.map(part => (
          <span
            key={part.label}
            style={{
              backgroundColor: seriesColor(part.series),
              width: `${(part.value / total) * 100}%`,
            }}
          />
        ))}
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 text-sm">
        {parts.map(part => (
          <div className="contents" key={part.label}>
            <dt className="text-muted-foreground flex items-center gap-2">
              <LegendSwatch series={part.series} />
              {part.label}
            </dt>
            <dd className="text-foreground text-end tabular-nums">
              {format(part.value)}{' '}
              <span className="text-muted-foreground">
                ({Math.round((part.value / total) * 100)}%)
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}
