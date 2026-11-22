import {
  type ChartColor,
  type ChartSize,
  type ChartType,
  chartColors,
  chartContract,
} from '@atom63/ui-foundation'
import * as React from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'

/*
 * Chart — a small dashboard chart drawn in SVG, with no charting library.
 * Line, area and bar (grouped or stacked) charts of a few numeric series over a
 * categorical axis. Only the marks are SVG; the axis labels, legend, tooltip and
 * data table are HTML, so text keeps its size at any width. The plot is one tab
 * stop: the arrow keys move between categories and show each one's values in
 * the tooltip. Every chart carries a table of the same numbers, visually hidden
 * unless `table="toggle"` lets a reader show it.
 *
 * Not for: big or live data, zooming, scatter or pie charts, or values below
 * zero. Use a Table when the exact numbers matter more than the shape.
 */

export interface ChartSeries {
  /** The series name, in the legend, the tooltip and the table header. */
  label: string
  /** One value per category, in the order of `categories`. Values are zero or more. */
  values: readonly number[]
  /** The series colour, `--a63-chart-<n>`. Defaults to the series' position, 1 to 5. */
  color?: ChartColor
}

export interface ChartLabels {
  /** The table toggle's label while the table is hidden. */
  showTable?: string
  /** The table toggle's label while the table shows. */
  hideTable?: string
  /** Read after the plot's name: how to move between categories. */
  keyboardHint?: string
}

export type ChartProps = Omit<React.ComponentProps<'figure'>, 'children'> & {
  /** The chart's accessible name, also the data table's caption. Required. */
  label: string
  /** A sentence that summarizes what the chart shows, read with its name. */
  description?: string
  /** The categories along the x axis, such as months. */
  categories: readonly string[]
  /** The series to draw, up to five. */
  series: readonly ChartSeries[]
  type?: ChartType
  /** Stack the series instead of drawing them side by side (bar) or over each other (area). Ignored for line. */
  stacked?: boolean
  size?: ChartSize
  /** Formats a value in the tooltip and the table. */
  formatValue?: (value: number) => string
  /** Formats a y-axis tick. Defaults to `formatValue`. */
  formatTick?: (value: number) => string
  /** The heading of the table's first column. */
  categoryLabel?: string
  /** Show the legend. Defaults to true when there is more than one series. */
  legend?: boolean
  /** `hidden` keeps the data table for screen readers only; `toggle` adds a button that shows it. */
  table?: 'hidden' | 'toggle'
  labels?: ChartLabels
}

const defaultLabels: Required<ChartLabels> = {
  showTable: 'Show data table',
  hideTable: 'Hide data table',
  keyboardHint: 'Use the arrow keys to read each value.',
}

const tickCounts: Record<ChartSize, number> = { sm: 3, md: 5 }

/** Ticks from zero to a tidy maximum at or above `max`: 110,000 in 5 ticks → 0, 30,000 … 120,000. */
export function chartTicks(max: number, count: number): number[] {
  const top = max > 0 ? max : 1
  const raw = top / (count - 1)
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const nice = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(step => step * magnitude >= raw) ?? 10
  // toPrecision drops the float noise of a fractional step (0.1 × 3 = 0.30000000000000004).
  return Array.from({ length: count }, (_, index) =>
    Number((index * nice * magnitude).toPrecision(12))
  )
}

const defaultFormat = (value: number) => value.toLocaleString()

export function Chart({
  label,
  description,
  categories,
  series,
  type = chartContract.defaultType,
  stacked = false,
  size = chartContract.defaultSize,
  formatValue = defaultFormat,
  formatTick = formatValue,
  categoryLabel = 'Category',
  legend = series.length > 1,
  table = 'hidden',
  labels,
  className,
  ...props
}: ChartProps): React.ReactElement {
  const id = React.useId()
  const text = { ...defaultLabels, ...labels }
  const [active, setActive] = React.useState<number | null>(null)
  const [announce, setAnnounce] = React.useState(false)
  const [tableOpen, setTableOpen] = React.useState(false)

  const count = categories.length
  const stacks = stacked && type !== 'line'
  const colors = series.map((item, index) => item.color ?? chartColors[index % chartColors.length])
  const value = (seriesIndex: number, category: number) =>
    Math.max(0, series[seriesIndex]?.values[category] ?? 0)
  const totals = categories.map((_, category) =>
    series.reduce((sum, _item, seriesIndex) => sum + value(seriesIndex, category), 0)
  )
  const max = stacks
    ? Math.max(0, ...totals)
    : Math.max(
        0,
        ...series.flatMap((_, seriesIndex) => categories.map((__, c) => value(seriesIndex, c)))
      )
  const ticks = chartTicks(max, tickCounts[size])
  const top = ticks[ticks.length - 1]

  // The plot is a 100 × 100 box stretched to its size; each category owns an
  // equal band, and a line's points sit in the middle of their bands.
  const band = count > 0 ? 100 / count : 100
  const center = (category: number) => (category + 0.5) * band
  const y = (amount: number) => 100 - (amount / top) * 100
  // The base and top of each series in each category, stacked or not.
  const spans = series.map((_, seriesIndex) =>
    categories.map((__, category) => {
      const base = stacks
        ? series.slice(0, seriesIndex).reduce((sum, _s, below) => sum + value(below, category), 0)
        : 0
      return [base, base + value(seriesIndex, category)] as const
    })
  )

  const marks =
    type === 'bar'
      ? series.map((_, seriesIndex) => {
          const width = stacks ? band * 0.5 : (band * 0.64) / Math.max(1, series.length)
          return (
            <g className="a63-Chart-series" data-color={colors[seriesIndex]} key={seriesIndex}>
              {spans[seriesIndex].map(([base, end], category) => (
                <rect
                  className="a63-Chart-bar"
                  height={y(base) - y(end)}
                  key={category}
                  width={width}
                  x={
                    stacks
                      ? center(category) - width / 2
                      : category * band + band * 0.18 + seriesIndex * width
                  }
                  y={y(end)}
                />
              ))}
            </g>
          )
        })
      : series.map((_, seriesIndex) => {
          const points = spans[seriesIndex].map(
            ([, end], category) => `${center(category)},${y(end)}`
          )
          const floor = spans[seriesIndex].map(
            ([base], category) => `${center(category)},${y(base)}`
          )
          return (
            <g className="a63-Chart-series" data-color={colors[seriesIndex]} key={seriesIndex}>
              {type === 'area' ? (
                <polygon
                  className="a63-Chart-area"
                  points={[...points, ...floor.reverse()].join(' ')}
                />
              ) : null}
              <polyline
                className="a63-Chart-line"
                points={points.join(' ')}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })

  const pick = (category: number | null, fromKeyboard: boolean) => {
    setActive(category)
    setAnnounce(fromKeyboard && category !== null)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (count === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    let fraction = (event.clientX - rect.left) / rect.width
    if (getComputedStyle(event.currentTarget).direction === 'rtl') fraction = 1 - fraction
    pick(Math.min(count - 1, Math.max(0, Math.floor(fraction * count))), false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (count === 0) return
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const current = active ?? -1
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: 1, ArrowDown: -1 }[
      event.key as 'ArrowRight'
    ]
    if (event.key === 'Escape' && active !== null) {
      event.preventDefault()
      pick(null, false)
      return
    }
    let next: number
    if (step !== undefined) next = current < 0 ? 0 : current + step
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = count - 1
    else return
    event.preventDefault()
    pick(Math.min(count - 1, Math.max(0, next)), true)
  }

  const readout =
    active === null
      ? ''
      : `${categories[active]}: ${series
          .map((item, seriesIndex) => `${item.label} ${formatValue(value(seriesIndex, active))}`)
          .join(', ')}`

  const descriptionId = description ? `${id}-description` : undefined
  const tableId = `${id}-table`
  const end = active !== null && center(active) > 50

  return (
    <figure
      aria-describedby={descriptionId}
      aria-label={label}
      className={cn('a63-Chart', className)}
      data-size={size}
      data-slot="chart"
      data-stacked={stacks || undefined}
      data-state={active === null ? 'rest' : 'current'}
      data-type={type}
      {...props}
    >
      {description ? (
        <p className="a63-Chart-sr-only" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {legend ? (
        <ul className="a63-Chart-legend" data-slot="chart-legend">
          {series.map((item, seriesIndex) => (
            <li className="a63-Chart-legend-item" key={item.label}>
              <Swatch color={colors[seriesIndex]} type={type} />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="a63-Chart-frame">
        <div aria-hidden className="a63-Chart-y-axis" data-slot="chart-y-axis">
          {[...ticks].reverse().map(tick => (
            <span className="a63-Chart-tick" key={tick}>
              {formatTick(tick)}
            </span>
          ))}
        </div>
        {/* The plot is one tab stop that reads its categories with the arrow keys, as
            the WAI chart guidance suggests; the data table carries the same numbers. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the plot takes the arrow keys and the pointer to pick a category. */}
        <div
          aria-describedby={`${id}-hint`}
          aria-label={label}
          className="a63-Chart-plot"
          data-slot="chart-plot"
          onBlur={() => pick(null, false)}
          onKeyDown={onKeyDown}
          onPointerLeave={() => pick(null, false)}
          onPointerMove={onPointerMove}
          role="group"
          tabIndex={count > 0 ? 0 : undefined}
        >
          <svg
            aria-hidden
            className="a63-Chart-marks"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {ticks.map(tick => (
              <line
                className={tick === 0 ? 'a63-Chart-baseline' : 'a63-Chart-grid'}
                key={tick}
                vectorEffect="non-scaling-stroke"
                x1="0"
                x2="100"
                y1={y(tick)}
                y2={y(tick)}
              />
            ))}
            {active !== null ? (
              type === 'bar' ? (
                <rect
                  className="a63-Chart-band"
                  height="100"
                  width={band}
                  x={active * band}
                  y="0"
                />
              ) : (
                <line
                  className="a63-Chart-guide"
                  vectorEffect="non-scaling-stroke"
                  x1={center(active)}
                  x2={center(active)}
                  y1="0"
                  y2="100"
                />
              )
            ) : null}
            {marks}
          </svg>
          {active !== null && type !== 'bar'
            ? series.map((_, seriesIndex) => (
                <span
                  aria-hidden
                  className="a63-Chart-dot"
                  data-color={colors[seriesIndex]}
                  key={seriesIndex}
                  style={{
                    insetBlockStart: `${y(spans[seriesIndex][active][1])}%`,
                    insetInlineStart: `${center(active)}%`,
                  }}
                />
              ))
            : null}
          {active !== null ? (
            <div
              aria-hidden
              className="a63-Chart-tooltip"
              data-slot="chart-tooltip"
              style={
                end
                  ? { insetInlineEnd: `${100 - center(active) + band / 2}%` }
                  : { insetInlineStart: `${center(active) + band / 2}%` }
              }
            >
              <div className="a63-Chart-tooltip-title">{categories[active]}</div>
              {series.map((item, seriesIndex) => (
                <div className="a63-Chart-tooltip-row" key={item.label}>
                  <Swatch color={colors[seriesIndex]} type={type} />
                  <span className="a63-Chart-tooltip-label">{item.label}</span>
                  <span className="a63-Chart-tooltip-value">
                    {formatValue(value(seriesIndex, active))}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <span className="a63-Chart-sr-only" id={`${id}-hint`}>
            {text.keyboardHint}
          </span>
        </div>
        <span />
        <div
          aria-hidden
          className="a63-Chart-x-axis"
          data-dense={count > 6 || undefined}
          data-slot="chart-x-axis"
        >
          {categories.map(category => (
            <span className="a63-Chart-category" key={category}>
              {category}
            </span>
          ))}
        </div>
      </div>
      <div aria-live="polite" className="a63-Chart-sr-only">
        {announce ? readout : ''}
      </div>
      {table === 'toggle' ? (
        <Button
          aria-controls={tableId}
          aria-expanded={tableOpen}
          className="a63-Chart-table-toggle"
          data-slot="chart-table-toggle"
          onClick={() => setTableOpen(open => !open)}
          size="sm"
          tone="muted"
          variant="ghost"
        >
          {tableOpen ? text.hideTable : text.showTable}
        </Button>
      ) : null}
      <div
        className="a63-Chart-table"
        data-slot="chart-table"
        data-visible={(table === 'toggle' && tableOpen) || undefined}
        id={tableId}
      >
        <Table size="sm">
          <TableCaption>{label}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{categoryLabel}</TableHead>
              {series.map(item => (
                <TableHead key={item.label} scope="col">
                  {item.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category}>
                <TableHead scope="row">{category}</TableHead>
                {series.map((item, seriesIndex) => (
                  <TableCell key={item.label}>{formatValue(value(seriesIndex, index))}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </figure>
  )
}

/* A legend or tooltip key: a short line for line and area charts, a square for bars. */
function Swatch({ color, type }: { color: ChartColor; type: ChartType }) {
  return (
    <svg aria-hidden className="a63-Chart-swatch" data-color={color} viewBox="0 0 12 12">
      {type === 'bar' ? (
        <rect className="a63-Chart-bar" height="10" width="10" x="1" y="1" />
      ) : (
        <line className="a63-Chart-line" x1="0" x2="12" y1="6" y2="6" />
      )}
    </svg>
  )
}
