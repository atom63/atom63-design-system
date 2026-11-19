import { sliderContract, sliderTones, themes } from '@atom63/ui-foundation'
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

/* A controlled range: onValuesChange reports every thumb, so the read-out
   follows both ends. */
export const ControlledRange: Story = {
  render: () => {
    const [range, setRange] = useState([25, 75])
    return (
      <div style={{ display: 'grid', gap: 8, width: 280 }}>
        <Slider
          getThumbAriaLabel={index => (index === 0 ? 'Minimum price' : 'Maximum price')}
          max={100}
          min={0}
          onValuesChange={setRange}
          value={range}
        />
        <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>
          {range[0]} – {range[1]}
        </span>
      </div>
    )
  },
}

/* Right-to-left inside UIProvider dir="rtl": the minimum sits on the right, and
   dragging or pressing the left arrow key raises the value. */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl" lang="ar">
      <div style={{ display: 'grid', gap: 16, width: 280 }}>
        <Slider aria-label="السطوع" defaultValue={30}>
          <SliderValue />
        </Slider>
        <Slider aria-label="النطاق" defaultValue={[25, 75]} />
      </div>
    </UIProvider>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 240 }}>
      <Slider aria-label="Volume" defaultValue={40} orientation="vertical" />
    </div>
  ),
}

/* tone sets the filled part: accent (the default) is the brand primary,
   neutral is the primary text colour, for players and tool bars. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 280 }}>
      {sliderTones.map(tone => (
        <Slider aria-label={`${tone} tone`} defaultValue={60} key={tone} tone={tone} />
      ))}
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
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
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
