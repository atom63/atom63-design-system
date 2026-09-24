import { themes, tooltipContract, tooltipSides } from '@atom63/ui-foundation'
import {
  Button,
  Tooltip,
  TooltipCreateHandle,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const meta = {
  title: 'UI React/Tooltip',
  component: Tooltip,
  decorators: [
    Story => (
      <TooltipProvider closeDelay={100} delay={300} timeout={400}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 48 }}>
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover or focus</Button>} />
      <TooltipPopup>Supplementary information</TooltipPopup>
    </Tooltip>
  ),
}

export const Sides: Story = {
  render: () => (
    <>
      {tooltipSides.map(side => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button variant="outline">{side}</Button>} />
          <TooltipPopup side={side} sideOffset={8}>
            Tooltip on {side}
          </TooltipPopup>
        </Tooltip>
      ))}
    </>
  ),
}

const sharedTooltip = TooltipCreateHandle<{ label: string }>()

export const SharedTooltip: Story = {
  render: () => (
    <>
      <TooltipTrigger
        handle={sharedTooltip}
        payload={{ label: 'Create a new file' }}
        render={<Button variant="outline">New</Button>}
      />
      <TooltipTrigger
        handle={sharedTooltip}
        payload={{ label: 'Open an existing file' }}
        render={<Button variant="outline">Open</Button>}
      />
      <TooltipTrigger
        handle={sharedTooltip}
        payload={{ label: 'Save current changes' }}
        render={<Button variant="outline">Save</Button>}
      />
      <Tooltip handle={sharedTooltip}>
        {({ payload }) => <TooltipPopup>{payload?.label}</TooltipPopup>}
      </Tooltip>
    </>
  ),
}

function AnchorAndPortalExample() {
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null)
  const [portal, setPortal] = useState<HTMLDivElement | null>(null)

  return (
    <div
      ref={setPortal}
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 16,
        minHeight: 120,
        padding: 24,
        position: 'relative',
        width: 320,
      }}
    >
      <span ref={setAnchor}>Custom anchor</span>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline">Trigger</Button>} />
        <TooltipPopup
          anchor={anchor}
          portalProps={{ container: portal }}
          side="bottom"
          sideOffset={8}
        >
          Positioned from the label
        </TooltipPopup>
      </Tooltip>
    </div>
  )
}

export const AnchorAndPortal: Story = {
  render: () => <AnchorAndPortalExample />,
}

function ThemeCell({ theme, mode }: { theme: (typeof themes)[number]; mode: 'light' | 'dark' }) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  return (
    <UIProvider mode={mode} theme={theme}>
      <div
        ref={setNode}
        style={{
          alignItems: 'center',
          background: 'var(--a63-surface-panel)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--a63-text-primary)',
          display: 'flex',
          gap: 12,
          minHeight: 80,
          padding: '0.75rem',
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
          {theme} / {mode}
        </span>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button variant="outline">Details</Button>} />
          <TooltipPopup portalProps={{ container: node }} side="right">
            Supplementary information
          </TooltipPopup>
        </Tooltip>
      </div>
    </UIProvider>
  )
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ThemeCell key={theme + mode} mode={mode} theme={theme} />
        ))
      )}
    </div>
  ),
}

function OpenTooltipCell({ label }: { label: string }) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  return (
    <div
      ref={setNode}
      style={{
        alignItems: 'flex-start',
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: '0.75rem',
        minHeight: 112,
        padding: '1rem',
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline">Details</Button>} />
        <TooltipPopup portalProps={{ container: node }} side="bottom" sideOffset={8}>
          Supplementary information
        </TooltipPopup>
      </Tooltip>
    </div>
  )
}

export const Endpoints: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        width: 'min(60rem, 80vw)',
      }}
    >
      <UIProvider designLanguage="web" input="pointer">
        <OpenTooltipCell label="web / pointer" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <OpenTooltipCell label="ios / touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <OpenTooltipCell label="extension / compact" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(tooltipContract, null, 2)}
    </pre>
  ),
}
