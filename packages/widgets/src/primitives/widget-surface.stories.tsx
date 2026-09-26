import { widgetInsetStyle, widgetTypeStyle, type WidgetSize } from '@atom63/widgets'
import { WidgetSurface } from '@atom63/widgets/primitives'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { FILL, MUTED, SingleWidget, WidgetFrame, WidgetTile } from '../stories/widget-frame'

/** Neutral filler, so the eye reads the frame rather than the content. */
function Filler({ label, size }: { label: string; size: WidgetSize }) {
  return (
    <div
      style={{
        ...widgetInsetStyle(size, 'face'),
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ ...MUTED, ...widgetTypeStyle('chrome') }}>{label}</span>
      <span style={widgetTypeStyle('display', size)}>2:26</span>
    </div>
  )
}

const meta = {
  title: 'Widgets/Surface',
  component: WidgetSurface,
  args: { size: 'small', children: null },
  render: ({ size }) => (
    <SingleWidget size={size}>
      <WidgetSurface size={size} style={FILL}>
        <Filler label={size} size={size} />
      </WidgetSurface>
    </SingleWidget>
  ),
} satisfies Meta<typeof WidgetSurface>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = {}

export const Medium: Story = { args: { size: 'medium' } }

export const Large: Story = { args: { size: 'large' } }

/**
 * The rim is a fixed width, so it looks the same at every footprint. A rim
 * that appears to grow is deriving from the tile rather than the contract.
 */
export const Footprints: Story = {
  render: () => (
    <WidgetFrame>
      <WidgetTile size="small">
        <WidgetSurface size="small" style={FILL}>
          <Filler label="small" size="small" />
        </WidgetSurface>
      </WidgetTile>
      <WidgetTile size="small">
        <WidgetSurface size="small" style={FILL}>
          <Filler label="small" size="small" />
        </WidgetSurface>
      </WidgetTile>
      <WidgetTile size="medium">
        <WidgetSurface size="medium" style={FILL}>
          <Filler label="medium" size="medium" />
        </WidgetSurface>
      </WidgetTile>
      <WidgetTile size="large">
        <WidgetSurface size="large" style={FILL}>
          <Filler label="large" size="large" />
        </WidgetSurface>
      </WidgetTile>
    </WidgetFrame>
  ),
}

export const Dark: Story = {
  render: Footprints.render,
  globals: { mode: 'dark' },
}
