import { panelSettingButtonContract, themes } from '@atom63/ui-foundation'
import { PanelSettingButton, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Palette, Settings } from 'lucide-react'

const meta = {
  title: 'UI React/PanelSettingButton',
  component: PanelSettingButton,
  argTypes: {
    active: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    active: false,
    label: 'Wallpaper',
    icon: <Palette aria-hidden />,
  },
} satisfies Meta<typeof PanelSettingButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, width: 320 }}>
      <PanelSettingButton icon={<Settings aria-hidden />} label="Theme" style={{ flex: 1 }} />
      <PanelSettingButton
        active
        icon={<Palette aria-hidden />}
        label="Wallpaper"
        style={{ flex: 1 }}
      />
      <PanelSettingButton
        disabled
        icon={<Palette aria-hidden />}
        label="Disabled"
        style={{ flex: 1 }}
      />
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
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <PanelSettingButton icon={<Settings aria-hidden />} label="Theme" />
              <PanelSettingButton active icon={<Palette aria-hidden />} label="Wallpaper" />
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
        <EndpointTiles label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointTiles label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointTiles label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(panelSettingButtonContract, null, 2)}
    </pre>
  ),
}

function EndpointTiles({ label }: { label: string }) {
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
      <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>{label}</span>
      <div style={{ display: 'flex', gap: 12, width: 260 }}>
        <PanelSettingButton icon={<Settings aria-hidden />} label="Theme" style={{ flex: 1 }} />
        <PanelSettingButton
          active
          icon={<Palette aria-hidden />}
          label="Wallpaper"
          style={{ flex: 1 }}
        />
      </div>
    </div>
  )
}
