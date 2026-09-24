import { radioContract, radioSizes, themes } from '@atom63/ui-foundation'
import { Label, Radio, RadioGroup, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Radio',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

const OPTIONS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'tree', label: 'Tree' },
]

export const Playground: Story = {
  render: () => (
    <RadioGroup defaultValue="grid">
      {OPTIONS.map(o => (
        <div key={o.value} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
          <Radio id={`radio-${o.value}`} value={o.value} />
          <Label
            htmlFor={`radio-${o.value}`}
            style={{ color: 'var(--a63-text-primary)', cursor: 'pointer', fontSize: 14 }}
          >
            {o.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
      <RadioGroup defaultValue="on" style={{ flexDirection: 'row', gap: 16 }}>
        <Radio aria-label="Example radio option" value="off" />
        <Radio aria-label="Example radio option" value="on" />
      </RadioGroup>
      <RadioGroup defaultValue="disabled-on" style={{ flexDirection: 'row', gap: 16 }}>
        <Radio aria-label="Example radio option, disabled" disabled value="disabled-off" />
        <Radio aria-label="Example radio option, disabled" disabled value="disabled-on" />
      </RadioGroup>
      <RadioGroup>
        <Radio aria-label="Example radio option, invalid" aria-invalid="true" value="invalid" />
      </RadioGroup>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <RadioGroup defaultValue="a" style={{ flexDirection: 'row', gap: 16 }}>
      {radioSizes.map(size => (
        <Radio aria-label="Example radio option" key={size} size={size} value={size} />
      ))}
    </RadioGroup>
  ),
}

/* Selection theming: the checked dot fills with --a63-selection-accent (= brand
   primary), following each theme + mode for free (same contract as Switch/Checkbox). */
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
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span
                style={{
                  color: 'var(--a63-text-secondary)',
                  fontSize: 12,
                  width: 96,
                }}
              >
                {theme} / {mode}
              </span>
              <RadioGroup defaultValue="on" style={{ flexDirection: 'row', gap: 12 }}>
                <Radio aria-label="Example radio option" value="off" />
                <Radio aria-label="Example radio option" value="on" />
                <Radio aria-label="Example radio option, disabled" disabled value="dis" />
              </RadioGroup>
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
        <EndpointRadios label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointRadios label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointRadios label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(radioContract, null, 2)}
    </pre>
  ),
}

function EndpointRadios({ label }: { label: string }) {
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
      <RadioGroup defaultValue="on" style={{ flexDirection: 'row', gap: 12 }}>
        <Radio aria-label="Example radio option" value="off" />
        <Radio aria-label="Example radio option" value="on" />
        <Radio aria-label="Example radio option, disabled" disabled value="disabled" />
      </RadioGroup>
    </div>
  )
}
