import { Button } from '@atom63/ui-react'
import { widgetInsetStyle, widgetTypeStyle, type WidgetSize } from '@atom63/widgets'
import { WidgetCardHeader, WidgetCardTitle } from '@atom63/widgets/primitives'
import {
  WidgetHostedShell,
  WidgetHostErrorFallback,
  WidgetHostLoadingShell,
  WidgetHostTitleTransition,
} from '@atom63/widgets/runtime'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Music } from 'lucide-react'
import { useState } from 'react'

import { MUTED, SingleWidget, WidgetFrame, WidgetTile } from '../stories/widget-frame'

const LAYOUT: Record<WidgetSize, { key: string; title: string; body: string }> = {
  small: { key: 'compact', title: 'Listening', body: 'One track' },
  medium: { key: 'grid', title: 'Recent listening', body: 'Three recent tracks, side by side' },
  large: {
    key: 'featured',
    title: 'Recent listening',
    body: 'The featured track, with the recent ones below it',
  },
}

function Listening({ size }: { size: WidgetSize }) {
  const layout = LAYOUT[size]
  return (
    <WidgetHostedShell
      contentKey={layout.key}
      header={
        <WidgetCardHeader>
          <WidgetHostTitleTransition contentKey={layout.key}>
            <WidgetCardTitle icon={<Music aria-hidden />}>{layout.title}</WidgetCardTitle>
          </WidgetHostTitleTransition>
        </WidgetCardHeader>
      }
      size={size}
    >
      <div style={{ ...widgetInsetStyle(size, 'body'), display: 'flex', flex: 1 }}>
        <span style={{ ...MUTED, ...widgetTypeStyle('body', size), alignSelf: 'flex-end' }}>
          {layout.body}
        </span>
      </div>
    </WidgetHostedShell>
  )
}

function HostedShellDemo() {
  const [size, setSize] = useState<WidgetSize>('medium')
  return (
    <div style={{ display: 'grid', gap: 'var(--a63-space-4)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', gap: 'var(--a63-space-2)' }}>
        {(['small', 'medium', 'large'] as const).map(value => (
          <Button
            aria-pressed={value === size}
            key={value}
            onClick={() => setSize(value)}
            size="sm"
            type="button"
            variant={value === size ? 'primary' : 'outline'}
          >
            {value}
          </Button>
        ))}
      </div>
      <div style={{ blockSize: 384 }}>
        <WidgetFrame>
          <WidgetTile size={size}>
            <Listening size={size} />
          </WidgetTile>
        </WidgetFrame>
      </div>
    </div>
  )
}

const meta = {
  title: 'Widgets/Hosted shell',
  component: WidgetHostedShell,
  args: { contentKey: 'grid', size: 'medium', children: null },
  render: () => <HostedShellDemo />,
} satisfies Meta<typeof WidgetHostedShell>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The card chrome stays mounted while the header title and the body crossfade
 * between the layouts of each footprint. Pick a size to see it.
 */
export const HostedShell: Story = {}

/** Shown while a widget module loads: the card and a spinner, no title. */
export const LoadingShell: Story = {
  render: () => (
    <SingleWidget size="small">
      <WidgetHostLoadingShell size="small" />
    </SingleWidget>
  ),
}

/** Shown when a widget fails to load or crashes while rendering. */
export const ErrorFallback: Story = {
  render: () => (
    <SingleWidget size="medium">
      <WidgetHostErrorFallback
        message="The widget module could not be loaded."
        onRetry={() => undefined}
        size="medium"
      />
    </SingleWidget>
  ),
}

export const Dark: Story = {
  render: () => (
    <WidgetFrame>
      <WidgetTile size="small">
        <WidgetHostLoadingShell size="small" />
      </WidgetTile>
      <WidgetTile size="small">
        <Listening size="small" />
      </WidgetTile>
      <WidgetTile size="medium">
        <WidgetHostErrorFallback
          message="The widget module could not be loaded."
          onRetry={() => undefined}
          size="medium"
        />
      </WidgetTile>
    </WidgetFrame>
  ),
  globals: { mode: 'dark' },
}
