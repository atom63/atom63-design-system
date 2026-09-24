import { resizableContract, themes } from '@atom63/ui-foundation'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'

const meta = {
  title: 'UI React/Resizable',
  component: ResizablePanelGroup,
} satisfies Meta<typeof ResizablePanelGroup>

export default meta
type Story = StoryObj<typeof meta>

const panelStyle: CSSProperties = {
  alignItems: 'center',
  color: 'var(--a63-text-primary)',
  display: 'flex',
  fontSize: 14,
  justifyContent: 'center',
  padding: 12,
}

/* A two-pane horizontal split with a plain hairline handle. */
export const Horizontal: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        borderRadius: 'var(--radius-lg)',
        height: 220,
        overflow: 'hidden',
        width: 'min(480px, 100%)',
      }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <div style={panelStyle}>Left</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div style={panelStyle}>Right</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

/* The `withHandle` grip makes the drag affordance explicit. */
export const WithHandle: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        borderRadius: 'var(--radius-lg)',
        height: 220,
        overflow: 'hidden',
        width: 480,
      }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <div style={panelStyle}>Sidebar</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div style={panelStyle}>Content</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

/* Vertical direction — the group stacks and the grip rotates. */
export const Vertical: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        borderRadius: 'var(--radius-lg)',
        height: 320,
        overflow: 'hidden',
        width: 480,
      }}
    >
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={50}>
          <div style={panelStyle}>Top</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div style={panelStyle}>Bottom</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

/* Every DS theme × light/dark — the handle + grip read from tokens. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={theme + mode} mode={mode} theme={theme}>
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
              <div style={{ flex: 1, height: 96, overflow: 'hidden' }}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={40}>
                    <div style={panelStyle}>Left</div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={60}>
                    <div style={panelStyle}>Right</div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Nested groups — a horizontal split whose right pane is a vertical split. */
export const Nested: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        borderRadius: 'var(--radius-lg)',
        height: 320,
        overflow: 'hidden',
        width: 480,
      }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <div style={panelStyle}>Nav</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <div style={panelStyle}>Main</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40}>
              <div style={panelStyle}>Console</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointResizable label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointResizable label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointResizable label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(resizableContract, null, 2)}
    </pre>
  ),
}

function EndpointResizable({ label }: { label: string }) {
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
      <div style={{ flex: 1, height: 96, minWidth: 240, overflow: 'hidden' }}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40}>
            <div style={panelStyle}>Left</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            <div style={panelStyle}>Right</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
