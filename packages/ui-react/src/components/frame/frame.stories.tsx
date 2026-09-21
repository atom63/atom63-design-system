import { frameBorders, frameContract, frameVariants, themes } from '@atom63/ui-foundation'
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Frame',
  component: Frame,
  argTypes: {
    variant: { control: 'inline-radio', options: frameVariants },
    border: { control: 'inline-radio', options: frameBorders },
  },
  args: { variant: 'muted-background', border: 'strong' },
} satisfies Meta<typeof Frame>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: args => (
    <Frame {...args} style={{ width: 'min(360px, 100%)' }}>
      <FrameHeader>
        <FrameTitle>Appearance</FrameTitle>
        <FrameDescription>Tune the look of the site.</FrameDescription>
      </FrameHeader>
      <FramePanel>Panel content sits inside the tray.</FramePanel>
      <FrameFooter>Footer</FrameFooter>
    </Frame>
  ),
}

/* Stacked panels: siblings under one tray get a concentric inner radius + gap. */
export const StackedPanels: Story = {
  render: args => (
    <Frame {...args} style={{ width: 360 }} variant="muted-card">
      <FramePanel>First panel</FramePanel>
      <FramePanel>Second panel</FramePanel>
      <FramePanel surface="muted">Override surface</FramePanel>
    </Frame>
  ),
}

/* Every named tray+panel preset. */
export const Variants: Story = {
  render: args => (
    <div style={{ display: 'grid', gap: 16 }}>
      {frameVariants.map(variant => (
        <Frame {...args} key={variant} style={{ width: 320 }} variant={variant}>
          <FrameHeader>
            <FrameTitle>{variant}</FrameTitle>
          </FrameHeader>
          <FramePanel>Panel</FramePanel>
        </Frame>
      ))}
    </div>
  ),
}

/* Chrome follows each theme + mode via the surface tokens. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <Frame border="subtle" style={{ width: 320 }} variant="muted-card">
              <FrameHeader>
                <FrameTitle>
                  {theme} / {mode}
                </FrameTitle>
              </FrameHeader>
              <FramePanel>Panel</FramePanel>
            </Frame>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

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
          props: { density: 'compact', designLanguage: 'web', input: 'pointer' } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div style={{ background: 'var(--a63-surface-page)', padding: 12 }}>
            <Frame border="subtle" style={{ width: 320 }} variant="muted-card">
              <FrameHeader>
                <FrameTitle>{endpoint.label}</FrameTitle>
                <FrameDescription>Endpoint-aware surface chrome.</FrameDescription>
              </FrameHeader>
              <FramePanel>Panel</FramePanel>
            </Frame>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(frameContract, null, 2)}
    </pre>
  ),
}
