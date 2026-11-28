import { UIProvider } from '@atom63/ui-react'
import type { WidgetSize } from '@atom63/widgets'
import { WidgetCard } from '@atom63/widgets/primitives'
import {
  WidgetStateFeedback,
  widgetStateCopy,
  type WidgetFeedbackState,
} from '@atom63/widgets/state'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { FILL, SingleWidget, WidgetFrame, WidgetTile } from '../stories/widget-frame'

const COPY = widgetStateCopy({
  empty: 'No weather data yet',
  error: 'Unable to load weather',
  loading: 'Loading weather',
})

const ERROR = new Error('Request to /api/weather failed with status 503 (Service Unavailable).')

function StateCard({ size, state }: { size: WidgetSize; state: WidgetFeedbackState }) {
  return (
    <WidgetCard size={size} style={FILL}>
      <WidgetStateFeedback copy={COPY(state, ERROR)} onRetry={() => undefined} state={state} />
    </WidgetCard>
  )
}

const meta = {
  title: 'Widgets/States',
  component: WidgetStateFeedback,
  args: { state: 'loading', size: 'small', copy: { title: 'Loading weather' } },
  render: ({ size = 'small', state }) => (
    <SingleWidget size={size}>
      <StateCard size={size} state={state} />
    </SingleWidget>
  ),
} satisfies Meta<typeof WidgetStateFeedback>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {}

export const Empty: Story = { args: { state: 'empty' } }

/** Retry, and the error's own message behind a details disclosure. */
export const ErrorState: Story = { name: 'Error', args: { state: 'error' } }

/** The 2x2 footprint uses the large density. */
export const ErrorLarge: Story = { args: { state: 'error', size: 'large' } }

/** Every state at every footprint. 1x1 and 2x1 share one density. */
export const Footprints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--a63-space-6)' }}>
      {(['loading', 'empty', 'error'] as const).map(state => (
        <WidgetFrame columns={4} key={state}>
          <WidgetTile size="small">
            <StateCard size="small" state={state} />
          </WidgetTile>
          <WidgetTile size="medium">
            <StateCard size="medium" state={state} />
          </WidgetTile>
          <WidgetTile size="small">
            <StateCard size="small" state={state} />
          </WidgetTile>
        </WidgetFrame>
      ))}
    </div>
  ),
}

export const Dark: Story = {
  render: Footprints.render,
  globals: { mode: 'dark' },
}

/**
 * On a touch screen the recovery controls keep their 24px proportion inside the
 * tile, and their hit areas grow to 44 physical px (--widget-interaction-target)
 * around them. The 165px cell scales the canvas down, so the target is measured
 * after the presentation transform.
 */
export const ErrorTouch: Story = {
  play: ({ canvasElement }) => {
    const canvas = canvasElement.querySelector<HTMLElement>('[data-widget-presentation-canvas]')
    const buttons = canvasElement.querySelectorAll<HTMLElement>(
      '.a63-WidgetStateFeedback .a63-Button'
    )
    if (!canvas || buttons.length === 0) throw new Error('Expected widget recovery controls')
    const scale = canvas.getBoundingClientRect().width / canvas.offsetWidth
    for (const button of buttons) {
      const hitArea = getComputedStyle(button, '::before')
      const width = parseFloat(hitArea.width) * scale
      const height = parseFloat(hitArea.height) * scale
      if (!(width >= 43.5 && height >= 43.5)) {
        const name = button.getAttribute('aria-label') ?? button.textContent
        throw new Error(`${name}: hit area is ${width.toFixed(1)}×${height.toFixed(1)}px`)
      }
    }
  },
  render: () => (
    <UIProvider input="touch">
      <SingleWidget cellPx={165} size="small">
        <StateCard size="small" state="error" />
      </SingleWidget>
    </UIProvider>
  ),
}
