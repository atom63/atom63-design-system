import { labelContract, themes } from '@atom63/ui-foundation'
import { Field, Input, Label, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Label',
  component: Label,
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => <Label htmlFor="email">Email address</Label>,
}

/* Associated with a native control via htmlFor. */
export const WithControl: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 6, width: 240 }}>
      <Label htmlFor="story-name">Full name</Label>
      <Input id="story-name" placeholder="Ada Lovelace" />
    </div>
  ),
}

/* Dimmed when nested in a disabled group. */
export const DisabledGroup: Story = {
  render: () => (
    <div data-disabled="" style={{ display: 'grid', gap: 6, width: 240 }}>
      <Label htmlFor="disabled-field">Disabled field</Label>
      <Input defaultValue="Unavailable" disabled id="disabled-field" />
    </div>
  ),
}

export const InvalidField: Story = {
  render: () => (
    <Field data-invalid="true" style={{ width: 240 }}>
      <Label htmlFor="invalid-email">Email address</Label>
      <Input defaultValue="not-an-email" id="invalid-email" invalid />
    </Field>
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
              <Label htmlFor={`${theme}-${mode}-email`}>Email address</Label>
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
        <EndpointField id="web-label" label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointField id="ios-label" label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointField id="compact-label" label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(labelContract, null, 2)}
    </pre>
  ),
}

function EndpointField({ id, label }: { id: string; label: string }) {
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
      <div style={{ display: 'grid', gap: 6, width: 240 }}>
        <Label htmlFor={id}>Email address</Label>
        <Input id={id} placeholder="you@atom63.io" />
      </div>
    </div>
  )
}
