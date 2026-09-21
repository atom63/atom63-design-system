import { collapsibleContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties, ReactNode } from 'react'

const meta = {
  title: 'UI React/Collapsible',
  component: Collapsible,
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

const bodyStyle: CSSProperties = {
  background: 'var(--a63-surface-muted)',
  color: 'var(--a63-text-secondary)',
  fontFamily: 'var(--a63-control-font-family)',
  fontSize: 'var(--a63-control-font-size-sm)',
  padding: '0.75rem 1rem',
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

function Disclosure({ label = 'Show details' }: { label?: string }) {
  return (
    <Frame>
      <Collapsible defaultOpen>
        <CollapsibleTrigger
          render={
            <Button
              style={{ borderRadius: 0, justifyContent: 'space-between', width: '100%' }}
              type="button"
              variant="ghost"
            />
          }
        >
          {label}
          <CollapsibleIndicator />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div style={bodyStyle}>
            This content is revealed when the disclosure is expanded and follows the measured panel
            height.
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Frame>
  )
}

export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Disclosure />
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
                alignItems: 'flex-start',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, paddingTop: 8, width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ flex: 1, maxWidth: 320 }}>
                <Disclosure label={`Details in ${theme}`} />
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
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer">
        <Disclosure label="Web / pointer" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <Disclosure label="iOS / touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <Disclosure label="Extension / compact" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(collapsibleContract, null, 2)}
    </pre>
  ),
}
