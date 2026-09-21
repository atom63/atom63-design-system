import { sidebarContract, themes } from '@atom63/ui-foundation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    side: { control: 'inline-radio', options: sidebarContract.sides },
    variant: { control: 'inline-radio', options: sidebarContract.variants },
    collapsible: { control: 'inline-radio', options: sidebarContract.collapsibles },
  },
  args: {
    side: 'left',
    variant: 'sidebar',
    collapsible: 'offcanvas',
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: args => (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarHeader>
          <SidebarInput placeholder="Search…" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Projects</SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Active</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Archived</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Settings</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Account</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div style={{ padding: 16 }}>
          <SidebarTrigger />
          <p>Main content — toggle the sidebar with the button or Cmd/Ctrl+B.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
}

export const Collapsible: Story = {
  args: { collapsible: 'icon' },
  render: Playground.render,
}

/*
 * A compact, non-collapsible sidebar that renders inline (no fixed-position
 * app-shell chrome), so it composes cleanly inside the theme matrix and the
 * variant grid without overlapping. `collapsible="none"` short-circuits to the
 * static `.a63-Sidebar--static` branch.
 */
function StaticDemo({
  variant = 'sidebar',
}: {
  variant?: (typeof sidebarContract.variants)[number]
}) {
  return (
    <SidebarProvider style={{ minHeight: 0, width: 'auto' }}>
      <Sidebar collapsible="none" style={{ width: '13rem' }} variant={variant}>
        <SidebarHeader>
          <SidebarInput placeholder="Search…" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Projects</SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Active</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Settings</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Account</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export const DocsPreview: Story = {
  render: () => <StaticDemo />,
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 16 }}>
      {sidebarContract.variants.map(variant => (
        <div key={variant} style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{variant}</span>
          <StaticDemo variant={variant} />
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
              <StaticDemo />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointSidebar label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointSidebar label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointSidebar label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(sidebarContract, null, 2)}
    </pre>
  ),
}

function EndpointSidebar({ label }: { label: string }) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: 8,
        padding: 12,
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      <StaticDemo variant="floating" />
    </div>
  )
}
