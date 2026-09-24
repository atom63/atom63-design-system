import { themes, toggleGroupContract, toggleSizes, toggleTones } from '@atom63/ui-foundation'
import { ToggleGroup, ToggleGroupItem, ToggleGroupSeparator, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CircleDot } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { pendingContrastReview } from '../story-probes'

function Demo({
  multiple = false,
  orientation,
  size,
  tone,
}: {
  multiple?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: (typeof toggleSizes)[number]
  tone?: (typeof toggleTones)[number]
}) {
  const [value, setValue] = useState<string[]>(['left'])
  return (
    <ToggleGroup
      multiple={multiple}
      onValueChange={setValue}
      orientation={orientation}
      size={size}
      tone={tone}
      value={value}
    >
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  )
}

const meta = {
  title: 'UI React/ToggleGroup',
  component: ToggleGroup,
  argTypes: {
    size: { control: 'inline-radio', options: toggleSizes },
    tone: { control: 'inline-radio', options: toggleTones },
    multiple: { control: 'boolean' },
  },
  args: { multiple: false, size: 'md', tone: 'neutral' },
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

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

export const Playground: Story = {
  render: ({ multiple, size, tone }) => <Demo multiple={multiple} size={size} tone={tone} />,
}

export const Multiple: Story = { render: () => <Demo multiple /> }

/* Figma A63-System 432:1335 — joined gel cells, pressed-in selection. */
export const IconBar: Story = {
  render: () => {
    const [neutral, setNeutral] = useState<string[]>(['a'])
    const [accent, setAccent] = useState<string[]>(['a'])
    return (
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <ToggleGroup onValueChange={setNeutral} value={neutral}>
          <ToggleGroupItem aria-label="One" value="a">
            <CircleDot aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Two" value="b">
            <CircleDot aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Three" disabled value="c">
            <CircleDot aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Four" value="d">
            <CircleDot aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup onValueChange={setAccent} tone="accent" value={accent}>
          <ToggleGroupItem aria-label="One" value="a">
            <CircleDot aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Two" value="b">
            <CircleDot aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Three" disabled value="c">
            <CircleDot aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Four" value="d">
            <CircleDot aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    )
  },
}

export const WithSeparator: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['bold'])
    return (
      <ToggleGroup multiple onValueChange={setValue} value={value}>
        <ToggleGroupItem value="bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic">I</ToggleGroupItem>
        <ToggleGroupItem value="underline">U</ToggleGroupItem>
        <ToggleGroupSeparator />
        <ToggleGroupItem value="left">L</ToggleGroupItem>
        <ToggleGroupItem value="center">C</ToggleGroupItem>
      </ToggleGroup>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {toggleSizes.map(size => (
        <Demo key={size} size={size} />
      ))}
    </div>
  ),
}

export const Tones: Story = {
  parameters: pendingContrastReview,
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Demo tone="neutral" />
      <Demo tone="accent" />
    </div>
  ),
}

export const Vertical: Story = { render: () => <Demo orientation="vertical" /> }

export const Disabled: Story = {
  render: () => (
    <ToggleGroup disabled value={['center']}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
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
              <Demo />
              <Demo tone="accent" />
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer">
        <PreviewCard label="web / pointer">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <PreviewCard label="ios / touch">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <PreviewCard label="extension / compact">
          <Demo />
        </PreviewCard>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(toggleGroupContract, null, 2)}
    </pre>
  ),
}
