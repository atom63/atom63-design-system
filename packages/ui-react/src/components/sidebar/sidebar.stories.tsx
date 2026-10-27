import { sidebarContract, sidebarMenuButtonTones, themes } from '@atom63/ui-foundation'
import {
  Button,
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
  SidebarMenuBadge,
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
import { FileText, Inbox, Send, Star } from 'lucide-react'

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

/* tone sets the active menu button: neutral (the default) is the hover plate
   with primary text, accent is the opt-in primary wash with accent text. */
export const MenuButtonTones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {sidebarMenuButtonTones.map(tone => (
        <SidebarProvider key={tone} style={{ minHeight: 0, width: 'auto' }}>
          <Sidebar collapsible="none">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>tone=&quot;{tone}&quot;</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive tone={tone}>
                        Dashboard
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tone={tone}>Projects</SidebarMenuButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#active" isActive tone={tone}>
                            Active
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#archived" tone={tone}>
                            Archived
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      ))}
    </div>
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
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>{variant}</span>
          <StaticDemo variant={variant} />
        </div>
      ))}
    </div>
  ),
}

/*
 * A dark sidebar on a light app (a mail client, a chat app): wrap the Sidebar in
 * <UIProvider mode="dark">. The scope keeps the theme, brand and density of the
 * app and resolves every token inside it for dark mode, so the sidebar surface,
 * its text, the active item, badges and the primary button all follow with no
 * mode checks. The rest of the app stays light.
 */
export const DarkSidebar: Story = {
  render: () => (
    <UIProvider mode="light">
      <SidebarProvider style={{ minHeight: 0 }}>
        <UIProvider mode="dark">
          <Sidebar aria-label="Mailboxes" collapsible="none" style={{ width: '14rem' }}>
            <SidebarHeader>
              <span style={{ fontWeight: 600, paddingInline: 'var(--a63-space-2)' }}>Mail</span>
              <Button variant="primary">New message</Button>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <Inbox aria-hidden />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>16</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FileText aria-hidden />
                      <span>Drafts</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Send aria-hidden />
                      <span>Sent</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Star aria-hidden />
                      <span>Starred</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </UIProvider>
        <main
          data-testid="light-app"
          style={{
            background: 'var(--a63-surface-panel)',
            color: 'var(--a63-text-primary)',
            flex: 1,
            padding: 'var(--a63-space-4)',
          }}
        >
          The inbox stays light.
        </main>
      </SidebarProvider>
    </UIProvider>
  ),
  play: ({ canvasElement }) => {
    const sidebar = canvasElement.querySelector<HTMLElement>('[data-slot="sidebar"]')
    const app = canvasElement.querySelector<HTMLElement>('[data-testid="light-app"]')
    if (!sidebar || !app) throw new Error('Expected the sidebar and the app')
    const style = getComputedStyle(sidebar)
    // The sidebar's aliases resolve in its own (dark) scope, not in the wrapper's.
    const alias = style.getPropertyValue('--sidebar-bg').trim()
    const token = style.getPropertyValue('--a63-surface-sidebar').trim()
    if (alias !== token) {
      throw new Error(`Expected --sidebar-bg to resolve in the dark scope: ${alias} vs ${token}`)
    }
    if (style.color === getComputedStyle(app).color) {
      throw new Error(`Expected light sidebar text on the dark surface, got ${style.color}`)
    }
  },
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
