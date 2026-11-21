import { loadMoreTriggerContract, loadMoreTriggerVariants, themes } from '@atom63/ui-foundation'
import { Button, LoadMoreTrigger, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/LoadMoreTrigger',
  component: LoadMoreTrigger,
  argTypes: {
    variant: { control: 'inline-radio', options: loadMoreTriggerVariants },
    state: {
      control: 'select',
      options: loadMoreTriggerContract.states.filter(state => state !== 'custom'),
    },
    hasMore: { control: 'boolean' },
    isLoading: { control: 'boolean' },
  },
  args: { hasMore: true, isLoading: false, variant: 'default' },
} satisfies Meta<typeof LoadMoreTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* Explicit state API uses the shared state-tone contract. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <LoadMoreTrigger state="idle" />
      <LoadMoreTrigger state="loading" />
      <LoadMoreTrigger onRetry={() => {}} state="failed" />
      <LoadMoreTrigger state="exhausted" />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {loadMoreTriggerVariants.map(variant => (
        <LoadMoreTrigger hasMore isLoading key={variant} variant={variant} />
      ))}
    </div>
  ),
}

export const Exhausted: Story = {
  args: { state: 'exhausted' },
}

export const Failed: Story = {
  args: { onRetry: () => {}, state: 'failed' },
}

/* On a touch screen the Retry text keeps its size, and its hit area grows to the
   44px touch target (--a63-control-min-target) around it. */
export const FailedTouch: Story = {
  play: ({ canvasElement }) => {
    const retry = canvasElement.querySelector<HTMLElement>('[data-slot="load-more-trigger-action"]')
    if (!retry) throw new Error('Expected a Retry action')
    const hitArea = getComputedStyle(retry, '::before')
    const [width, height] = [parseFloat(hitArea.width), parseFloat(hitArea.height)]
    if (!(width >= 44 && height >= 44)) {
      throw new Error(`Retry hit area is ${width}×${height}px, expected at least 44×44`)
    }
  },
  render: () => (
    <UIProvider input="touch">
      <LoadMoreTrigger onRetry={() => {}} state="failed" />
    </UIProvider>
  ),
}

/* Custom children take over the row entirely (e.g. a manual "Load more" button). */
export const CustomChildren: Story = {
  render: () => (
    <LoadMoreTrigger hasMore isLoading={false}>
      <Button type="button" variant="secondary">
        Load more
      </Button>
    </LoadMoreTrigger>
  ),
}

/* The loading row (spinner + message) across all 4 DS themes × light/dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <LoadMoreTrigger hasMore isLoading />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The sRGBA channels of a computed CSS colour, read back through a canvas so any
   colour syntax (oklch, color-mix) resolves the way the browser paints it. */
function paintedRgba(color: string): [number, number, number, number] {
  const context = document.createElement('canvas').getContext('2d')
  if (!context) throw new Error('Expected a 2D canvas context')
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0, a = 0] = context.getImageData(0, 0, 1, 1).data
  return [r, g, b, a / 255]
}

function over(
  top: [number, number, number, number],
  base: [number, number, number]
): [number, number, number] {
  const [r, g, b, a] = top
  return [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)]
}

/* The colour an element sits on: its own and its ancestors' fills, composited
   from the first opaque one up. */
function backdrop(element: HTMLElement): [number, number, number] {
  const layers: [number, number, number, number][] = []
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const fill = paintedRgba(getComputedStyle(node).backgroundColor)
    if (fill[3] > 0) layers.push(fill)
    if (fill[3] >= 0.99) break
  }
  return layers.reduceRight<[number, number, number]>(
    (base, layer) => over(layer, base),
    [255, 255, 255]
  )
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const luminance = (rgb: [number, number, number]) => {
    const [r = 0, g = 0, b = 0] = rgb.map(channel => {
      const c = channel / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/* The failed row across all 4 DS themes × light/dark. The Retry label is text
   (WCAG 1.4.3, 4.5:1) and the error icon a graphic (1.4.11, 3:1). */
export const FailedThemes: Story = {
  play: ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>('[data-failed-row]')
    if (rows.length !== themes.length * 2)
      throw new Error('Expected a failed row per theme and mode')
    for (const row of rows) {
      const checks = [
        ['Retry label', row.querySelector<HTMLElement>('.a63-LoadMoreTrigger-action'), 4.5],
        ['error icon', row.querySelector<HTMLElement>('.a63-LoadMoreTrigger-icon'), 3],
      ] as const
      for (const [name, element, min] of checks) {
        if (!element) throw new Error(`${row.dataset.failedRow}: no ${name}`)
        const base = backdrop(element)
        const ratio = contrast(over(paintedRgba(getComputedStyle(element).color), base), base)
        if (ratio < min) {
          throw new Error(`${row.dataset.failedRow}: ${name} is ${ratio.toFixed(2)}:1 < ${min}:1`)
        }
      }
    }
  },
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              data-failed-row={`${theme}/${mode}`}
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <LoadMoreTrigger onRetry={() => {}} state="failed" />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointTrigger label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointTrigger label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointTrigger label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(loadMoreTriggerContract, null, 2)}
    </pre>
  ),
}

function EndpointTrigger({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        paddingInline: 12,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>{label}</span>
      <LoadMoreTrigger hasMore isLoading variant="prominent" />
    </div>
  )
}
