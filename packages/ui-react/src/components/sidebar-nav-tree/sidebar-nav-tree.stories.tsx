import { sidebarNavTreeContract, themes } from '@atom63/ui-foundation'
import {
  Sidebar,
  SidebarContent,
  SidebarNavCollapsibleItem,
  SidebarNavGroup,
  SidebarNavLinkItem,
  SidebarNavSubLinkItem,
  SidebarNavSubList,
  SidebarProvider,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const meta = {
  title: 'UI React/SidebarNavTree',
  component: SidebarNavGroup,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SidebarNavGroup>

export default meta
// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

function Tree() {
  const [open, setOpen] = useState(true)
  return (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarNavGroup label="Getting started">
            <SidebarNavLinkItem isActive>
              <a href="#intro">Introduction</a>
            </SidebarNavLinkItem>
            <SidebarNavLinkItem>
              <a href="#install">Installation</a>
            </SidebarNavLinkItem>
            <SidebarNavCollapsibleItem
              label="Components"
              link={<a href="#components">Components</a>}
              onOpenChange={setOpen}
              open={open}
            >
              <SidebarNavSubList>
                <SidebarNavSubLinkItem>
                  <a href="#button">Button</a>
                </SidebarNavSubLinkItem>
                <SidebarNavSubLinkItem isActive>
                  <a href="#sidebar">Sidebar</a>
                </SidebarNavSubLinkItem>
              </SidebarNavSubList>
            </SidebarNavCollapsibleItem>
          </SidebarNavGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

export const Playground: Story = {
  render: () => <Tree />,
}

function SectionOnlyTree() {
  const [open, setOpen] = useState(true)
  return (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarNavGroup label="Articles">
            <SidebarNavCollapsibleItem label="Foundations" onOpenChange={setOpen} open={open}>
              <SidebarNavSubList>
                <SidebarNavSubLinkItem isActive>
                  <a href="#tokens">Tokens as decisions</a>
                </SidebarNavSubLinkItem>
                <SidebarNavSubLinkItem>
                  <a href="#themes">Themes</a>
                </SidebarNavSubLinkItem>
              </SidebarNavSubList>
            </SidebarNavCollapsibleItem>
          </SidebarNavGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

/** Sections without a page of their own: the whole row is the toggle. */
export const SectionWithoutLink: Story = {
  render: () => <SectionOnlyTree />,
}

function CompactTree() {
  const [open, setOpen] = useState(true)
  return (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarNavGroup label="Docs">
            <SidebarNavLinkItem isActive>
              <a href="#intro">Introduction</a>
            </SidebarNavLinkItem>
            <SidebarNavCollapsibleItem
              label="Components"
              link={<a href="#components">Components</a>}
              onOpenChange={setOpen}
              open={open}
            >
              <SidebarNavSubList>
                <SidebarNavSubLinkItem isActive>
                  <a href="#sidebar">Sidebar</a>
                </SidebarNavSubLinkItem>
              </SidebarNavSubList>
            </SidebarNavCollapsibleItem>
          </SidebarNavGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
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
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ width: 240 }}>
                <CompactTree />
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointTree label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointTree label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointTree label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(sidebarNavTreeContract, null, 2)}
    </pre>
  ),
}

function EndpointTree({ label }: { label: string }) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: 8,
        padding: 12,
        width: 280,
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      <CompactTree />
    </div>
  )
}
