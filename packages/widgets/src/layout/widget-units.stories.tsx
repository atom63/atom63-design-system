import {
  WIDGET_CANONICAL_CELL_PX,
  WIDGET_TYPE_RAMP,
  WIDGET_UNIT_SPAN,
  WidgetGrid,
  widgetInsetStyle,
  widgetTypeStyle,
  WidgetViewport,
  type WidgetSize,
  type WidgetTypeRampRole,
} from '@atom63/widgets'
import {
  WidgetCard,
  WidgetCardContent,
  WidgetCardHeader,
  WidgetCardTitle,
} from '@atom63/widgets/primitives'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ruler } from 'lucide-react'

import { FILL, MUTED, SingleWidget } from '../stories/widget-frame'

function SpanCard({ size }: { size: WidgetSize }) {
  const { cols, rows } = WIDGET_UNIT_SPAN[size]
  return (
    <WidgetCard size={size} style={FILL}>
      <WidgetCardHeader>
        <WidgetCardTitle icon={<Ruler aria-hidden />}>{size}</WidgetCardTitle>
      </WidgetCardHeader>
      <WidgetCardContent style={{ flex: 1, justifyContent: 'flex-end' }}>
        <span style={widgetTypeStyle('headline', size)}>
          {cols}×{rows}
        </span>
        <span style={{ ...MUTED, ...widgetTypeStyle('label', size) }}>widget units</span>
      </WidgetCardContent>
    </WidgetCard>
  )
}

const meta = {
  title: 'Widgets/Units and scale',
  component: WidgetViewport,
  args: { size: 'small', children: null },
} satisfies Meta<typeof WidgetViewport>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A two-track WidgetGrid. Each tile is a WidgetViewport: small spans 1×1,
 * medium 2×1 and large 2×2, and every tile keeps its shape at every width.
 */
export const Grid: Story = {
  render: () => (
    <div style={{ inlineSize: 384 }}>
      <WidgetGrid columns={2} gap={8}>
        {(['small', 'small', 'medium', 'large'] as const).map((size, index) => (
          <WidgetViewport key={index} size={size}>
            <SpanCard size={size} />
          </WidgetViewport>
        ))}
      </WidgetGrid>
    </div>
  ),
}

/**
 * One composition at three host cells. The viewport scales the whole canvas
 * from the canonical 188px cell, down for narrow cells and up to 137.5%.
 */
export const Scale: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--a63-space-6)' }}>
      {[165, WIDGET_CANONICAL_CELL_PX, 258].map(cellPx => (
        <figure key={cellPx} style={{ display: 'grid', gap: 'var(--a63-space-2)', margin: 0 }}>
          <SingleWidget cellPx={cellPx} size="small">
            <SpanCard size="small" />
          </SingleWidget>
          <figcaption style={{ ...MUTED, fontSize: 'var(--typography-xs-font-size)' }}>
            {cellPx}px cell · {Math.round((cellPx / WIDGET_CANONICAL_CELL_PX) * 1000) / 10}%
          </figcaption>
        </figure>
      ))}
    </div>
  ),
}

const ROLES = Object.keys(WIDGET_TYPE_RAMP) as WidgetTypeRampRole[]

/** Every type ramp role, authored in design px and floored in CSS px. */
export const TypeRamp: Story = {
  render: () => (
    <SingleWidget size="large">
      <WidgetCard size="large" style={FILL}>
        <div style={{ ...widgetInsetStyle('large', 'face'), display: 'grid' }}>
          {ROLES.map(role => (
            <span key={role} style={{ ...widgetTypeStyle(role, 'large'), lineHeight: 1.1 }}>
              {role}
            </span>
          ))}
        </div>
      </WidgetCard>
    </SingleWidget>
  ),
}

export const Dark: Story = {
  render: Grid.render,
  globals: { mode: 'dark' },
}
