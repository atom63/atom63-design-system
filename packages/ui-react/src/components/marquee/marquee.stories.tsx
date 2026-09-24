import { marqueeContract, themes } from '@atom63/ui-foundation'
import { Badge, Marquee, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Marquee',
  component: Marquee,
} satisfies Meta<typeof Marquee>

export default meta
// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

const chips = ['Design', 'Engineering', 'Motion', 'Systems', 'Type', 'Color']

function Chip({ label }: { label: string }): React.ReactElement {
  return <Badge variant="secondary">{label}</Badge>
}

export const Playground: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, width: 'min(420px, 100%)' }}>
      <Marquee aria-label="Design disciplines; hover or focus to pause" pauseOnHover tabIndex={0}>
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>
        Hover or focus to pause
      </span>
    </div>
  ),
}

export const Reverse: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Marquee reverse>
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 200, width: 200 }}>
      <Marquee vertical>
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
    </div>
  ),
}

export const Paused: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Marquee paused>
        {chips.map(c => (
          <Chip key={c} label={c} />
        ))}
      </Marquee>
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
                overflow: 'hidden',
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Marquee pauseOnHover paused>
                  {chips.map(c => (
                    <Chip key={c} label={c} />
                  ))}
                </Marquee>
              </div>
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
        <EndpointMarquee label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointMarquee label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointMarquee label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(marqueeContract, null, 2)}
    </pre>
  ),
}

function EndpointMarquee({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        overflow: 'hidden',
        padding: 12,
      }}
    >
      <span style={{ flex: '0 0 112px', fontSize: 12, opacity: 0.7 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Marquee paused>
          {chips.map(chip => (
            <Chip key={chip} label={chip} />
          ))}
        </Marquee>
      </div>
    </div>
  )
}
