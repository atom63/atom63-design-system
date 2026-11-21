import {
  artPlateSafeAreas,
  artPlateSizes,
  artPlateTones,
  artPlateVeils,
  themes,
} from '@atom63/ui-foundation'
import { ArtPlate, Button, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

// Remote pictures are pinned to one placeholder in the visual and craft runs.
const PLATE = 'https://picsum.photos/id/1018/1920/1080'

const meta = {
  title: 'UI React/ArtPlate',
  component: ArtPlate,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    safeArea: { control: 'inline-radio', options: artPlateSafeAreas },
    size: { control: 'inline-radio', options: artPlateSizes },
    tone: { control: 'inline-radio', options: artPlateTones },
    veil: { control: 'inline-radio', options: artPlateVeils },
  },
  args: {
    alt: '',
    focus: { x: 0.5, y: 0.7 },
    safeArea: 'top',
    size: 'band',
    src: PLATE,
    tone: 'media',
    veil: 'soft',
  },
} satisfies Meta<typeof ArtPlate>

export default meta
type Story = StoryObj<typeof meta>

function HeroCopy() {
  return (
    <div style={{ display: 'grid', gap: 'var(--a63-space-4)', maxInlineSize: '36rem' }}>
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--a63-type-display-large-font-size)',
          lineHeight: 'var(--a63-type-display-large-line-height)',
        }}
      >
        Render at the speed of thought
      </h1>
      <p style={{ margin: 0 }}>A motion timeline that renders in the browser.</p>
      <div style={{ display: 'flex', gap: 'var(--a63-space-2)' }}>
        <Button>Start free</Button>
        <Button variant="outline">Read the docs</Button>
      </div>
    </div>
  )
}

export const Playground: Story = {
  render: args => (
    <ArtPlate {...args}>
      <HeroCopy />
    </ArtPlate>
  ),
}

export const Viewport: Story = {
  args: { priority: true, size: 'viewport', safeArea: 'center' },
  render: args => (
    <ArtPlate {...args}>
      <HeroCopy />
    </ArtPlate>
  ),
}

export const SafeAreas: Story = {
  render: args => (
    <div style={{ display: 'grid', gap: 'var(--a63-space-4)' }}>
      {artPlateSafeAreas.map(safeArea => (
        <ArtPlate key={safeArea} {...args} safeArea={safeArea}>
          <p style={{ margin: 0 }}>safeArea=&quot;{safeArea}&quot;</p>
        </ArtPlate>
      ))}
    </div>
  ),
}

export const Card: Story = {
  args: { size: 'card', safeArea: 'bottom', veil: 'strong' },
  render: args => (
    <div style={{ padding: 'var(--a63-space-6)' }}>
      <ArtPlate {...args}>
        <p style={{ margin: 0 }}>Ship your next render tonight.</p>
      </ArtPlate>
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--a63-space-3)' }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div style={{ background: 'var(--a63-surface-page)', padding: 'var(--a63-space-3)' }}>
              <ArtPlate alt="" safeArea="start" size="card" src={PLATE} tone="page" veil="strong">
                <p style={{ margin: 0 }}>
                  {theme} / {mode}
                </p>
              </ArtPlate>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}
