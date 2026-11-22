/*
 * The plan mix: parts of a whole as one stacked bar, with the numbers listed
 * under it. The line and bar charts on the overview are the system's Chart;
 * this is a share bar, not a chart over a categorical axis, so it stays here.
 * It takes the same chart colour tokens (--a63-chart-1 … 5), which keep apart
 * from the brand on every brand.
 */
export type ChartSeries = 1 | 2 | 3 | 4 | 5

const seriesColor = (series: ChartSeries) => `var(--a63-chart-${series})`

function LegendSwatch({ series }: { series: ChartSeries }) {
  return (
    <span
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: seriesColor(series) }}
    />
  )
}

export interface ShareBarProps {
  caption: string
  format: (value: number) => string
  parts: readonly { label: string; series: ChartSeries; value: number }[]
}

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
