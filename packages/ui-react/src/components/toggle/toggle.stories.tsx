import { themes, toggleContract, toggleSizes, toggleTones } from '@atom63/ui-foundation'
import { Toggle, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { pendingContrastReview } from '../story-probes'

const meta = {
  title: 'UI React/Toggle',
  component: Toggle,
  argTypes: {
    size: { control: 'inline-radio', options: toggleSizes },
    tone: { control: 'inline-radio', options: toggleTones },
    defaultPressed: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Grid', size: 'md', tone: 'neutral' },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {toggleSizes.map(size => (
        <Toggle key={size} defaultPressed size={size}>
          {size}
        </Toggle>
      ))}
    </div>
  ),
}

export const IconSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {toggleSizes.map(size => (
        <Toggle key={size} defaultPressed size={size}>
          <Star aria-hidden fill="currentColor" />
          {size}
        </Toggle>
      ))}
    </div>
  ),
}

export const Tones: Story = {
  parameters: pendingContrastReview,
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle defaultPressed tone="neutral">
        Neutral
      </Toggle>
      <Toggle defaultPressed tone="accent">
        Accent
      </Toggle>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle>Rest</Toggle>
      <Toggle defaultPressed>Pressed</Toggle>
      <Toggle disabled>Disabled</Toggle>
      <Toggle defaultPressed disabled>
        Disabled on
      </Toggle>
    </div>
  ),
}

/* Gapped independent toggles — compose standalone Toggles, not ToggleGroup. */
export const GappedRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--a63-control-gap)', alignItems: 'center' }}>
      <Toggle defaultPressed>Bold</Toggle>
      <Toggle>Italic</Toggle>
      <Toggle>Underline</Toggle>
    </div>
  ),
}

function PreviewCard({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: '0.75rem',
        padding: '1rem',
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      {children}
    </div>
  )
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
              <Toggle defaultPressed>On</Toggle>
              <Toggle defaultPressed tone="accent">
                Accent
              </Toggle>
              <Toggle>Off</Toggle>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer">
        <PreviewCard label="web / pointer">
          <Toggle defaultPressed>Toggle</Toggle>
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <PreviewCard label="ios / touch">
          <Toggle defaultPressed>Toggle</Toggle>
        </PreviewCard>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(toggleContract, null, 2)}
    </pre>
  ),
}
