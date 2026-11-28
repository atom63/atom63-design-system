// Chart has its own entry so the root entry stays within its bundle budget; most
// pages that import from the root draw no chart.
export { Chart } from '../components/chart'
export type { ChartLabels, ChartProps, ChartSeries } from '../components/chart'
