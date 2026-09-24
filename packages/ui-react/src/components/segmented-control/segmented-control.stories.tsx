import {
  segmentedControlContract,
  segmentedControlSizes,
  segmentedControlTones,
  segmentedControlVariants,
  themes,
} from '@atom63/ui-foundation'
import { SegmentedControl, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GitBranch, Grid, List } from 'lucide-react'
import { type ReactNode, useState } from 'react'

const ITEMS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'tree', label: 'Tree' },
]

const ICON_ITEMS = [
  { value: 'list', label: 'List', icon: <List /> },
  { value: 'grid', label: 'Grid', icon: <Grid /> },
  { value: 'tree', label: 'Tree', icon: <GitBranch /> },
]

const LONG_ITEMS = [
  { value: 'list', label: 'Project overview' },
  { value: 'activity', label: 'Recent activity' },
  { value: 'permissions', label: 'Access permissions' },
  { value: 'integrations', label: 'Connected integrations' },
]

function Demo({
  animateBackplate,
  items = ITEMS,
  size,
  tabClassName,
  tone,
  variant,
}: {
  animateBackplate?: boolean
  items?: typeof ITEMS
  size?: (typeof segmentedControlSizes)[number]
  tabClassName?: string
  tone?: (typeof segmentedControlTones)[number]
  variant?: (typeof segmentedControlVariants)[number]
}) {
  const [value, setValue] = useState('list')
  return (
    <SegmentedControl
      animateBackplate={animateBackplate}
      items={items}
      onValueChange={setValue}
      size={size}
      tabClassName={tabClassName}
      tone={tone}
      value={value}
      variant={variant}
    />
  )
}

const meta = {
  title: 'UI React/SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    size: { control: 'inline-radio', options: segmentedControlSizes },
    variant: { control: 'inline-radio', options: segmentedControlVariants },
    tone: { control: 'inline-radio', options: segmentedControlTones },
    animateBackplate: { control: 'boolean' },
  },
  args: { size: 'md', tone: 'neutral', variant: 'label', animateBackplate: true },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: ({ animateBackplate, size, tone, variant }) => (
    <Demo animateBackplate={animateBackplate} size={size} tone={tone} variant={variant} />
  ),
}

// Documents `animateBackplate` (default true) — set false to drop the indicator's
// sliding transition — and the `tabClassName` per-segment escape hatch.
export const Backplate: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Demo animateBackplate />
      <Demo animateBackplate={false} />
      <Demo tabClassName="uppercase" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {segmentedControlSizes.map(size => (
        <Demo key={size} size={size} />
      ))}
    </div>
  ),
}

export const MobileOverflow: Story = {
  tags: ['!manifest'],
  render: () => (
    <UIProvider input="touch">
      <div style={{ maxWidth: 320, width: 'min(100%, calc(100vw - 2rem))' }}>
        <Demo items={LONG_ITEMS} />
      </div>
    </UIProvider>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Demo variant="label" />
      <Demo items={ICON_ITEMS} variant="icon" />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Demo tone="neutral" />
      <Demo tone="accent" />
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
              <Demo />
              <Demo tone="accent" />
            </div>
          </UIProvider>
        ))
      )}
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
        gap: '0.875rem',
        padding: '1rem',
      }}
    >
      <div
        style={{
          color: 'var(--a63-text-secondary)',
          fontFamily: 'Geist Mono, monospace',
          fontSize: '0.75rem',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

export const Endpoints: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer" mode="light">
        <PreviewCard label="web / light / pointer">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="web" input="pointer" mode="dark">
        <PreviewCard label="web / dark / pointer">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="light">
        <PreviewCard label="ios / light / touch">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="dark">
        <PreviewCard label="ios / dark / touch">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer" mode="light">
        <PreviewCard label="compact extension / light">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer" mode="dark">
        <PreviewCard label="compact extension / dark">
          <Demo />
        </PreviewCard>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(segmentedControlContract, null, 2)}
    </pre>
  ),
}
