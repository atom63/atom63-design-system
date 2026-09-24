import { brands, switchContract, switchSizes, themes } from '@atom63/ui-foundation'
import { Switch, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Moon, Sun } from 'lucide-react'
import { type CSSProperties, type ReactNode, useState } from 'react'

const meta = {
  title: 'UI React/Switch',
  component: Switch,
  argTypes: {
    size: { control: 'inline-radio', options: switchSizes },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    'aria-label': 'Example switch',
    defaultChecked: true,
    disabled: false,
    size: 'md',
  },
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

function PreviewCard({
  children,
  label,
  style,
}: {
  children: ReactNode
  label: string
  style?: CSSProperties
}) {
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
        ...style,
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

function Row({ children }: { children: ReactNode }) {
  return <div style={{ alignItems: 'center', display: 'flex', gap: '0.75rem' }}>{children}</div>
}

function EnvironmentShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer" mode="light">
        <PreviewCard label="web / light / pointer">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="web" input="pointer" mode="dark">
        <PreviewCard label="web / dark / pointer">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="light">
        <PreviewCard label="ios / light / touch">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="dark">
        <PreviewCard label="ios / dark / touch">{children}</PreviewCard>
      </UIProvider>
    </div>
  )
}

function ThumbIcon({ checked }: { checked: boolean }) {
  const Icon = checked ? Moon : Sun
  return (
    <Icon
      aria-hidden
      style={{
        display: 'block',
        height: '0.65em',
        minHeight: 10,
        minWidth: 10,
        width: '0.65em',
      }}
    />
  )
}

function IconSwitch({
  className,
  defaultChecked = false,
  size = 'md',
}: {
  className?: string
  defaultChecked?: boolean
  size?: (typeof switchSizes)[number]
}) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <Switch
      aria-label={checked ? 'Dark appearance' : 'Light appearance'}
      checked={checked}
      className={className}
      onCheckedChange={setChecked}
      size={size}
    >
      <ThumbIcon checked={checked} />
    </Switch>
  )
}

export const Playground: Story = {
  render: args => (
    <EnvironmentShell>
      <Switch {...args} />
    </EnvironmentShell>
  ),
}

/* The design-language proof: web is compact, iOS is a larger pill — same
   component, distinct platform shape. */
export const States: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <Row>
          <Switch aria-label="Example switch" />
          <Switch aria-label="Example switch, checked" defaultChecked />
        </Row>
        <Row>
          <Switch aria-label="Example switch, disabled" disabled />
          <Switch aria-label="Example switch, checked, disabled" defaultChecked disabled />
        </Row>
      </div>
    </EnvironmentShell>
  ),
}

export const Sizes: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {switchSizes.map(size => (
          <Row key={size}>
            <Switch aria-label="Example switch" size={size} />
            <Switch aria-label="Example switch, checked" defaultChecked size={size} />
            <span style={{ color: 'var(--a63-text-secondary)', fontSize: '0.75rem' }}>{size}</span>
          </Row>
        ))}
      </div>
    </EnvironmentShell>
  ),
}

/**
 * Thumb children (icons) with package-default root styling — use this to
 * validate track/thumb/focus before any consumer color overrides.
 */
export const WithThumbIcon: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <Row>
          <IconSwitch />
          <IconSwitch defaultChecked />
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: '0.75rem' }}>
            default tokens
          </span>
        </Row>
        {switchSizes.map(size => (
          <Row key={size}>
            <IconSwitch size={size} />
            <IconSwitch defaultChecked size={size} />
            <span style={{ color: 'var(--a63-text-secondary)', fontSize: '0.75rem' }}>{size}</span>
          </Row>
        ))}
      </div>
    </EnvironmentShell>
  ),
}

/**
 * Same icon thumbs, with only `--switch-*` color overrides (sky / indigo).
 * Compare against WithThumbIcon to confirm root chrome stays package-owned.
 */
export const WithThumbIconColorOverride: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <Row>
          <IconSwitch className="a63-Switch--story-day-night" />
          <IconSwitch className="a63-Switch--story-day-night" defaultChecked />
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: '0.75rem' }}>
            --switch-track / --switch-accent
          </span>
        </Row>
      </div>
      <style>{`
        .a63-Switch--story-day-night {
          --switch-track: color-mix(in oklch, var(--color-sky-300, #7dd3fc) 50%, transparent);
          --switch-border: color-mix(in oklch, white 40%, transparent);
          --switch-accent: color-mix(in oklch, var(--color-indigo-950, #1e1b4b) 75%, transparent);
        }
      `}</style>
    </EnvironmentShell>
  ),
}

/* Checked = each theme's primary automatically (terminal green, etc.). */
export const Themes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
        padding: '1rem',
      }}
    >
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <PreviewCard label={`${theme} / ${mode}`}>
              <Row>
                <Switch aria-label="Example switch" />
                <Switch aria-label="Example switch, checked" defaultChecked />
              </Row>
            </PreviewCard>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Checked track follows the brand ramp. */
export const BrandRamps: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))',
      }}
    >
      {brands.map(brand => (
        <UIProvider brand={brand} key={brand} mode="light">
          <PreviewCard label={`brand / ${brand}`}>
            <Switch aria-label="Example switch, checked" defaultChecked />
          </PreviewCard>
        </UIProvider>
      ))}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <PreviewCard label="Web">
          <Row>
            <Switch aria-label="Example switch" />
            <Switch aria-label="Example switch, checked" defaultChecked />
          </Row>
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <PreviewCard label="iOS touch">
          <Row>
            <Switch aria-label="Example switch" />
            <Switch aria-label="Example switch, checked" defaultChecked />
          </Row>
        </PreviewCard>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <PreviewCard label="Compact extension">
          <Row>
            <Switch aria-label="Example switch" />
            <Switch aria-label="Example switch, checked" defaultChecked />
          </Row>
        </PreviewCard>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(switchContract, null, 2)}
    </pre>
  ),
}
