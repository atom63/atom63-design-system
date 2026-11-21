import { layeredScenePlacements, layeredSceneWidths } from '@atom63/ui-foundation'
import {
  Badge,
  Button,
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
  LayeredScene,
  LayeredSceneContent,
  LayeredSceneForeground,
  LayeredScenePlate,
  LayeredSceneStage,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

// Remote pictures are pinned to one placeholder in the visual and craft runs.
const PLATE = 'https://picsum.photos/id/1018/1920/1080'
const FOCUS = { x: 0.5, y: 0.7 }

// A stand-in cut-out: a ridge across the bottom eighth of the plate, transparent
// above it. A real scene uses a cut-out of its own plate.
const RIDGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"><path fill-opacity="0.9" d="M0 1000 L180 960 L360 990 L560 945 L760 985 L980 950 L1180 990 L1400 955 L1620 985 L1920 960 L1920 1080 L0 1080 Z"/></svg>'
  )

const meta = {
  title: 'UI React/LayeredScene',
  component: LayeredScene,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    placement: { control: 'inline-radio', options: layeredScenePlacements },
    width: { control: 'inline-radio', options: layeredSceneWidths },
  },
  args: { placement: 'center-bottom', width: 'wide' },
} satisfies Meta<typeof LayeredScene>

export default meta
type Story = StoryObj<typeof meta>

function ProductWindow() {
  return (
    <Frame>
      <FrameHeader>
        <FrameTitle>Render queue</FrameTitle>
        <FrameDescription>3 jobs running on 4 workers</FrameDescription>
      </FrameHeader>
      <FramePanel>
        <div style={{ display: 'grid', gap: 'var(--a63-space-2)' }}>
          <span>title-sequence.mov · 72%</span>
          <span>logo-sting.mov · 40%</span>
          <span>lower-thirds.mov · queued</span>
        </div>
        {/* Empty room at the bottom of the window: the only part the cut-out may cover. */}
        <div style={{ blockSize: 'var(--spacing-24)' }} />
      </FramePanel>
    </Frame>
  )
}

function Copy() {
  return (
    <>
      <Badge variant="secondary">Browser-native rendering</Badge>
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--a63-type-display-large-font-size)',
          lineHeight: 'var(--a63-type-display-large-line-height)',
          maxInlineSize: '18ch',
        }}
      >
        Render at the speed of thought
      </h1>
      <p style={{ margin: 0 }}>A motion timeline that renders in the browser.</p>
      <div style={{ display: 'flex', gap: 'var(--a63-space-2)' }}>
        <Button>Start free</Button>
        <Button variant="outline">Take a tour</Button>
      </div>
    </>
  )
}

export const Playground: Story = {
  render: args => (
    <LayeredScene {...args}>
      <LayeredScenePlate alt="" focus={FOCUS} priority src={PLATE} />
      <LayeredSceneContent>
        <Copy />
      </LayeredSceneContent>
      <LayeredSceneStage>
        <ProductWindow />
      </LayeredSceneStage>
      <LayeredSceneForeground focus={FOCUS} priority src={RIDGE} />
    </LayeredScene>
  ),
}

export const EndPlacement: Story = {
  args: { placement: 'end-bottom', width: 'half' },
  render: Playground.render,
}

export const WithoutForeground: Story = {
  render: args => (
    <LayeredScene {...args}>
      <LayeredScenePlate alt="" focus={FOCUS} src={PLATE} />
      <LayeredSceneContent>
        <Copy />
      </LayeredSceneContent>
      <LayeredSceneStage>
        <ProductWindow />
      </LayeredSceneStage>
    </LayeredScene>
  ),
}
