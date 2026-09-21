import { skeletonContract, themes } from '@atom63/ui-foundation'
import { Skeleton, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { render: () => <Skeleton style={{ height: 20, width: 200 }} /> }

/* Composed into a card placeholder — the muted pulse reads per theme/mode. */
export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 10, width: 260 }}>
      <Skeleton style={{ borderRadius: 'var(--radius-lg)', height: 140 }} />
      <Skeleton style={{ height: 16, width: '75%' }} />
      <Skeleton style={{ height: 14, width: '55%' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton style={{ height: 24, width: 56 }} />
        <Skeleton style={{ height: 24, width: 72 }} />
      </div>
    </div>
  ),
}

/* The muted pulse resolves against each DS theme × mode surface. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 'min(36rem, 80vw)' }}>
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
              <div style={{ display: 'grid', flex: 1, gap: 8, minWidth: 0 }}>
                <Skeleton style={{ height: 16, width: '80%' }} />
                <Skeleton style={{ height: 12, width: '55%' }} />
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
        <EndpointSkeleton label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointSkeleton label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointSkeleton label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

function EndpointSkeleton({ label }: { label: string }) {
  return (
    <div style={{ background: 'var(--a63-surface-panel)', display: 'grid', gap: 8, padding: 12 }}>
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      <Skeleton style={{ height: 16, width: 200 }} />
    </div>
  )
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(skeletonContract, null, 2)}
    </pre>
  ),
}
