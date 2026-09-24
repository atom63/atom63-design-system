import {
  type ConnectedPanelAlign,
  connectedPanelAligns,
  connectedPanelContract,
  themes,
} from '@atom63/ui-foundation'
import {
  Button,
  ButtonGroup,
  ConnectedPanel,
  ConnectedPanelBody,
  ConnectedPanelContent,
  ConnectedPanelDescription,
  ConnectedPanelFooter,
  ConnectedPanelHeader,
  ConnectedPanelTitle,
  ConnectedPanelTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const meta = {
  title: 'UI React/ConnectedPanel',
  component: ConnectedPanel,
  argTypes: {
    align: { control: 'inline-radio', options: connectedPanelAligns },
  },
  // Required prop; every story renders its own panel content.
  args: { children: null },
  decorators: [
    Story => (
      <div style={{ minHeight: 320, padding: 48 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConnectedPanel>

export default meta
type Story = StoryObj<typeof meta>

const CATEGORIES = ['All', 'Design', 'Engineering', 'Writing'] as const

function Demo({
  align = 'start',
  defaultOpen = false,
}: {
  align?: ConnectedPanelAlign
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>('All')
  return (
    <ConnectedPanel
      align={align}
      collapsedWidth={184}
      expandedWidth={336}
      onOpenChange={setOpen}
      open={open}
    >
      <ConnectedPanelTrigger label="Category" summary={active} />
      <ConnectedPanelContent>
        <ConnectedPanelHeader>
          <ConnectedPanelTitle>Project category</ConnectedPanelTitle>
          <ConnectedPanelDescription>Choose which work appears below.</ConnectedPanelDescription>
        </ConnectedPanelHeader>
        <ConnectedPanelBody>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            {CATEGORIES.map(category => (
              <Button
                key={category}
                onClick={() => {
                  setActive(category)
                  setOpen(false)
                }}
                variant={category === active ? 'primary' : 'outline'}
              >
                {category}
              </Button>
            ))}
          </div>
        </ConnectedPanelBody>
        <ConnectedPanelFooter>
          <Button
            onClick={() => {
              setActive('All')
              setOpen(false)
            }}
            size="sm"
            variant="ghost"
          >
            Reset
          </Button>
          <Button onClick={() => setOpen(false)} size="sm">
            Done
          </Button>
        </ConnectedPanelFooter>
      </ConnectedPanelContent>
    </ConnectedPanel>
  )
}

export const Playground: Story = {
  args: { align: 'start' },
  render: args => <Demo align={args.align} />,
}

export const ButtonGroupTrigger: Story = {
  render: () => (
    <ConnectedPanel collapsedWidth={188} expandedWidth={336} variant="button-group">
      <ButtonGroup aria-label="Panel and actions" size="sm">
        <ConnectedPanelTrigger label="Contents" showChevron={false} />
        <Button aria-label="More actions" size="sm" variant="outline">
          More
        </Button>
      </ButtonGroup>
      <ConnectedPanelContent>
        <ConnectedPanelBody>
          Secondary actions stay available while the panel expands.
        </ConnectedPanelBody>
      </ConnectedPanelContent>
    </ConnectedPanel>
  ),
}

export const Aligns: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {connectedPanelAligns.map(align => (
        <div key={align} style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>align={align}</span>
          <Demo align={align} />
        </div>
      ))}
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
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <Demo defaultOpen />
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
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'flex-start',
              background: 'var(--a63-surface-page)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              padding: '0.75rem',
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{endpoint.label}</span>
            <Demo defaultOpen />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(connectedPanelContract, null, 2)}
    </pre>
  ),
}
