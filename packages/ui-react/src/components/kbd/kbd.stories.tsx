import { kbdContract, kbdSizes, themes } from '@atom63/ui-foundation'
import { Kbd, KbdGroup, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Kbd',
  component: Kbd,
  argTypes: {
    size: { control: 'inline-radio', options: kbdSizes },
  },
  args: { children: 'K', size: 'md' },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {kbdSizes.map(size => (
        <Kbd key={size} size={size}>
          {size === 'sm' ? 'S' : 'M'}
        </Kbd>
      ))}
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
}

/* Kbd themes too: terminal swaps it to a mono keycap, aqua/retro shift its
   radius, and the muted surface/text/border recolor per theme × mode. */
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
                color: 'var(--a63-text-secondary)',
                display: 'flex',
                fontSize: 13,
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ width: 96, opacity: 0.7 }}>
                {theme} / {mode}
              </span>
              <span>Press</span>
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
              <Kbd size="sm">Esc</Kbd>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Kbd is presentational — it reads as a quiet hint next to real copy. */
export const InContext: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        color: 'var(--a63-text-secondary)',
        fontSize: 13,
      }}
    >
      <span>Press</span>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <span>to open the command menu, or</span>
      <Kbd>Esc</Kbd>
      <span>to dismiss.</span>
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointKeys label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointKeys label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointKeys label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(kbdContract, null, 2)}
    </pre>
  ),
}

function EndpointKeys({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-secondary)',
        display: 'flex',
        gap: 12,
        padding: 12,
      }}
    >
      <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{label}</span>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <Kbd size="sm">Esc</Kbd>
    </div>
  )
}
