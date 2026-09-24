import { progressContract, themes } from '@atom63/ui-foundation'
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Progress',
  component: Progress,
} satisfies Meta<typeof Progress>

export default meta
// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

export const Playground: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Progress value={40} />
    </div>
  ),
}

/* Composed with a label + a live value readout. */
export const WithLabelAndValue: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Progress value={68}>
        <div style={{ alignItems: 'baseline', display: 'flex', justifyContent: 'space-between' }}>
          <ProgressLabel>Downloading</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
}

export const Steps: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 280 }}>
      {[0, 25, 50, 75, 100].map(v => (
        <Progress key={v} value={v} />
      ))}
    </div>
  ),
}

/* value={null} = indeterminate (the primitive drops the width binding). */
export const Indeterminate: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Progress value={null} />
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
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ display: 'grid', gap: 10, width: 200 }}>
                <Progress value={68} />
                <Progress value={null} />
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
        <EndpointProgress label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointProgress label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointProgress label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(progressContract, null, 2)}
    </pre>
  ),
}

function EndpointProgress({ label }: { label: string }) {
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
      <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{label}</span>
      <div style={{ width: 240 }}>
        <Progress value={68} />
      </div>
    </div>
  )
}
