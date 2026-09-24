import { separatorContract, themes } from '@atom63/ui-foundation'
import { Separator, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <p style={{ margin: 0 }}>Above</p>
      <Separator style={{ margin: '12px 0' }} />
      <p style={{ margin: 0 }}>Below</p>
    </div>
  ),
}

/* Soft edge-to-edge gradient fade. */
export const Gradient: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <p style={{ margin: 0 }}>Above</p>
      <Separator style={{ margin: '12px 0' }} variant="gradient" />
      <p style={{ margin: 0 }}>Below</p>
    </div>
  ),
}

/* Vertical, dividing an inline row. */
export const Vertical: Story = {
  render: () => (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12, height: 24 }}>
      <span>Home</span>
      <Separator orientation="vertical" />
      <span>Docs</span>
      <Separator orientation="vertical" variant="gradient" />
      <span>About</span>
    </div>
  ),
}

export const Semantic: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <section aria-labelledby="separator-heading">
        <h3 id="separator-heading">Account</h3>
      </section>
      <Separator decorative={false} style={{ margin: '12px 0' }} />
      <section aria-label="Security">Security settings</section>
    </div>
  ),
}

export const Decorative: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <span>Visual grouping</span>
      <Separator decorative style={{ margin: '12px 0' }} variant="gradient" />
      <span>without document structure</span>
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
              <span>Home</span>
              <Separator orientation="vertical" />
              <span>Docs</span>
              <Separator orientation="vertical" variant="gradient" />
              <span>About</span>
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
        <EndpointSeparator label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointSeparator label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointSeparator label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(separatorContract, null, 2)}
    </pre>
  ),
}

function EndpointSeparator({ label }: { label: string }) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: 8,
        padding: 12,
        width: 360,
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      <Separator />
      <Separator variant="gradient" />
    </div>
  )
}
