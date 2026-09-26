import { widgetInsetStyle, widgetTypeStyle, type WidgetSize } from '@atom63/widgets'
import {
  WidgetBlock,
  WidgetBlockContent,
  WidgetBlockFooter,
  WidgetBlockHeader,
  WidgetCard,
  WidgetCardContent,
  WidgetCardHeader,
  WidgetCardHeaderLeft,
  WidgetCardHeaderRight,
  WidgetCardRow,
  WidgetCardTextGroup,
  WidgetCardTitle,
  WidgetShell,
} from '@atom63/widgets/primitives'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Activity, MapPin } from 'lucide-react'

import { FILL, MUTED, SingleWidget, WidgetFrame, WidgetTile } from '../stories/widget-frame'

function ActivityCard({ size }: { size: WidgetSize }) {
  return (
    <WidgetCard size={size} style={FILL}>
      <WidgetCardHeader>
        <WidgetCardHeaderLeft>
          <WidgetCardTitle icon={<Activity aria-hidden />}>Activity</WidgetCardTitle>
        </WidgetCardHeaderLeft>
      </WidgetCardHeader>
      <WidgetCardContent style={{ flex: 1, justifyContent: 'flex-end' }}>
        <span style={widgetTypeStyle('display', size)}>42</span>
        <WidgetCardRow>
          <span style={{ ...MUTED, ...widgetTypeStyle('label', size) }}>commits this week</span>
        </WidgetCardRow>
      </WidgetCardContent>
    </WidgetCard>
  )
}

const meta = {
  title: 'Widgets/Card',
  component: WidgetCard,
  args: { size: 'medium', children: null },
  render: ({ size }) => (
    <SingleWidget size={size}>
      <ActivityCard size={size} />
    </SingleWidget>
  ),
} satisfies Meta<typeof WidgetCard>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = { args: { size: 'small' } }

export const Medium: Story = {}

export const Large: Story = { args: { size: 'large' } }

/** The three footprints side by side: 1x1, 2x1 and 2x2 on one grid. */
export const Footprints: Story = {
  render: () => (
    <WidgetFrame>
      <WidgetTile size="small">
        <ActivityCard size="small" />
      </WidgetTile>
      <WidgetTile size="small">
        <ActivityCard size="small" />
      </WidgetTile>
      <WidgetTile size="medium">
        <ActivityCard size="medium" />
      </WidgetTile>
      <WidgetTile size="large">
        <ActivityCard size="large" />
      </WidgetTile>
    </WidgetFrame>
  ),
}

/** Header start and end slots, with an action on the end. */
export const HeaderSlots: Story = {
  render: () => (
    <SingleWidget size="medium">
      <WidgetCard size="medium" style={FILL}>
        <WidgetCardHeader>
          <WidgetCardHeaderLeft>
            <WidgetCardTitle icon={<MapPin aria-hidden />}>Location</WidgetCardTitle>
          </WidgetCardHeaderLeft>
          <WidgetCardHeaderRight>
            <span style={{ ...MUTED, ...widgetTypeStyle('label') }}>Now</span>
          </WidgetCardHeaderRight>
        </WidgetCardHeader>
        <WidgetCardContent>
          <WidgetCardTextGroup>
            <span style={widgetTypeStyle('headline', 'medium')}>Lisbon</span>
            <span style={{ ...MUTED, ...widgetTypeStyle('body', 'medium') }}>
              Clear, 24 degrees
            </span>
          </WidgetCardTextGroup>
        </WidgetCardContent>
      </WidgetCard>
    </SingleWidget>
  ),
}

/** A block stacks an optional header, a growing body and a pinned footer. */
export const Blocks: Story = {
  render: () => (
    <SingleWidget size="large">
      <WidgetCard size="large" style={FILL}>
        <WidgetBlock style={widgetInsetStyle('large', 'face')}>
          <WidgetBlockHeader>
            <span style={widgetTypeStyle('title', 'large')}>Reading list</span>
          </WidgetBlockHeader>
          <WidgetBlockContent>
            <span style={{ ...MUTED, ...widgetTypeStyle('body', 'large') }}>
              The block content grows to fill the space between the header and the footer.
            </span>
          </WidgetBlockContent>
          <WidgetBlockFooter>
            <span style={{ ...MUTED, ...widgetTypeStyle('label', 'large') }}>3 of 12</span>
          </WidgetBlockFooter>
        </WidgetBlock>
      </WidgetCard>
    </SingleWidget>
  ),
}

/** WidgetShell composes the card, header, title and content in one call. */
export const Shell: Story = {
  render: () => (
    <SingleWidget size="medium">
      <WidgetShell icon={<Activity aria-hidden />} size="medium" style={FILL} title="Activity">
        <span style={widgetTypeStyle('body', 'medium')}>Shell content</span>
      </WidgetShell>
    </SingleWidget>
  ),
}

export const Dark: Story = {
  render: Footprints.render,
  globals: { mode: 'dark' },
}
