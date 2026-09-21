import { sliderContract, themes } from '@atom63/ui-foundation'
import { Slider, SliderValue, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const meta = { title: 'UI React/Slider', component: Slider } satisfies Meta<typeof Slider>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState(40)
    return (
      <div style={{ width: 280 }}>
        <Slider aria-label="Tint" max={100} min={0} onValueChange={setValue} value={value} />
      </div>
    )
  },
}

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState(64)
    return (
      <div style={{ width: 280 }}>
        <Slider aria-label="Brightness" max={100} min={0} onValueChange={setValue} value={value}>
          <SliderValue />
        </Slider>
      </div>
    )
  },
}

export const Ranged: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Slider aria-label="Range" defaultValue={[25, 75]} max={100} min={0} />
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 240 }}>
      <Slider aria-label="Volume" defaultValue={40} orientation="vertical" />
    </div>
  ),
}

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
                borderRadius: 'var(--radius-lg)',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ width: 200 }}>
                <Slider aria-label="Tint" defaultValue={40} max={100} min={0} />
              </div>
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
        <EndpointSlider label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointSlider label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointSlider label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

function EndpointSlider({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        padding: 12,
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>{label}</span>
      <div style={{ width: 220 }}>
        <Slider aria-label={`${label} tint`} defaultValue={40} />
      </div>
    </div>
  )
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(sliderContract, null, 2)}
    </pre>
  ),
}
