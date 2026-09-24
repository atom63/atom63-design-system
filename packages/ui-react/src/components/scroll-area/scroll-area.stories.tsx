import { scrollAreaContract, themes } from '@atom63/ui-foundation'
import { ScrollArea, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = { title: 'UI React/ScrollArea', component: ScrollArea } satisfies Meta<
  typeof ScrollArea
>
export default meta
type Story = StoryObj<typeof meta>

const ROWS = Array.from({ length: 20 }, (_, i) => `Row ${i + 1}`)

function Demo({
  height = 200,
  scrollFade = true,
  scrollbarGutter,
  showScrollbarOnHover,
  width = 280,
}: {
  height?: number
  scrollFade?: boolean
  scrollbarGutter?: boolean
  showScrollbarOnHover?: boolean
  width?: number
}) {
  return (
    <ScrollArea
      scrollFade={scrollFade}
      scrollbarGutter={scrollbarGutter}
      showScrollbarOnHover={showScrollbarOnHover}
      style={{
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        height,
        width,
      }}
    >
      <div style={{ display: 'grid', gap: 8, padding: 12 }}>
        {ROWS.map(row => (
          <div key={row} style={{ color: 'var(--a63-text-primary)', fontSize: 14 }}>
            {row}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export const Playground: Story = {
  render: () => <Demo />,
}

export const Horizontal: Story = {
  render: () => (
    <ScrollArea
      scrollFade
      style={{
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: 280,
      }}
    >
      <div style={{ display: 'flex', gap: 8, padding: 12, width: 'max-content' }}>
        {ROWS.map(row => (
          <div
            key={row}
            style={{
              background: 'var(--a63-surface-panel)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--a63-text-primary)',
              fontSize: 14,
              minWidth: 80,
              padding: 12,
              textAlign: 'center',
            }}
          >
            {row}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Options: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Demo scrollFade={false} />
      <Demo scrollbarGutter />
      <Demo showScrollbarOnHover />
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
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Demo height={140} width={220} />
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
        <EndpointScrollArea label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointScrollArea label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointScrollArea label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(scrollAreaContract, null, 2)}
    </pre>
  ),
}

function EndpointScrollArea({ label }: { label: string }) {
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
      <Demo height={120} showScrollbarOnHover width={240} />
    </div>
  )
}
