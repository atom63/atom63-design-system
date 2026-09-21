import { checkboxContract, checkboxSizes, themes } from '@atom63/ui-foundation'
import { Checkbox, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Checkbox',
  component: Checkbox,
  argTypes: {
    size: { control: 'inline-radio', options: checkboxSizes },
  },
  args: { size: 'md' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { args: { defaultChecked: true } }

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Checkbox />
      <Checkbox defaultChecked />
      <Checkbox indeterminate />
      <Checkbox defaultChecked disabled />
      <Checkbox disabled />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {checkboxSizes.map(size => (
        <Checkbox defaultChecked key={size} size={size} />
      ))}
    </div>
  ),
}

/* A checkbox in context — the checked fill follows the brand primary. */
export const WithLabel: Story = {
  render: () => (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <Checkbox defaultChecked id="cb-updates" />
      <label
        htmlFor="cb-updates"
        style={{ color: 'var(--a63-text-primary)', cursor: 'pointer', fontSize: 14 }}
      >
        Email me about updates
      </label>
    </div>
  ),
}

/* Selection theming: the checked fill is --a63-selection-accent (= brand primary),
   so it follows each theme + mode for free (same contract as Switch). */
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
                borderRadius: '0.75rem',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span
                style={{
                  color: 'var(--a63-text-secondary)',
                  fontSize: 12,
                  opacity: 0.7,
                  width: 96,
                }}
              >
                {theme} / {mode}
              </span>
              <Checkbox />
              <Checkbox defaultChecked />
              <Checkbox indeterminate />
              <Checkbox defaultChecked disabled />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same choice control reviewed against target host contexts. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
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
            <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>
              {endpoint.label}
            </span>
            <Checkbox />
            <Checkbox defaultChecked />
            <Checkbox indeterminate />
            <Checkbox defaultChecked disabled />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(checkboxContract, null, 2)}
    </pre>
  ),
}
