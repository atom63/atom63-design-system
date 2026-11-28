import { sidebarContract, sidebarMenuButtonTones, themes } from '@atom63/ui-foundation'
import {
  Button,
  PortalContainerProvider,
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
  SidebarMenuAction,
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
import { FileText, Inbox, MoreHorizontal, Send, Star } from 'lucide-react'
import { type ReactNode, useLayoutEffect, useState } from 'react'

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

/*
 * The menu button's states side by side: current (`isActive`), under the
 * pointer, at rest and disabled, with a fine pointer and on touch. Pressed
 * (`:active`) and an open menu (`data-open`) paint the same plate as hover, so
 * the hover capture covers them.
 */
function StatesSidebar({ hover = false }: { hover?: boolean }) {
  return (
    <SidebarProvider style={{ minHeight: 0, width: 'auto' }}>
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Inbox aria-hidden />
                    <span>Current</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton data-hover-target={hover || undefined}>
                    <Send aria-hidden />
                    <span>Hover</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText aria-hidden />
                    <span>Rest</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Star aria-hidden />
                    <span>Disabled</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

export const States: Story = {
  parameters: { visualState: { hover: '[data-hover-target]' } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 12 }}>
      <UIProvider input="pointer">
        <StatesSidebar hover />
      </UIProvider>
      <UIProvider input="touch">
        <StatesSidebar />
      </UIProvider>
    </div>
  ),
  play: ({ canvasElement }) => {
    // Rows keep the 32px rung on a fine pointer and floor at 44px on touch.
    for (const [input, floor] of [
      ['pointer', 32],
      ['touch', 44],
    ] as const) {
      const rows = canvasElement.querySelectorAll<HTMLElement>(
        `[data-a63-input="${input}"] [data-slot="sidebar-menu-button"]`
      )
      if (rows.length !== 4) throw new Error(`Expected 4 ${input} rows, got ${rows.length}`)
      for (const row of rows) {
        const height = Math.round(row.getBoundingClientRect().height)
        if (input === 'touch' ? height < floor : height !== floor)
          throw new Error(`A ${input} row is ${height}px tall, expected ${floor}px`)
      }
    }
  },
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

const railItems = [
  { icon: Inbox, label: 'Inbox' },
  { icon: FileText, label: 'Drafts' },
  { icon: Send, label: 'Sent' },
  { icon: Star, label: 'Starred' },
]

/*
 * The collapsed icon rail. Each label is hidden visually but stays in the
 * accessibility tree, so every icon-only button keeps its name; the tooltip
 * shows it on hover.
 */
export const IconRail: Story = {
  render: () => (
    <SidebarProvider defaultOpen={false} style={{ minHeight: 0 }}>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {railItems.map(({ icon: Icon, label }, index) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton isActive={index === 0} tooltip={label}>
                    <Icon aria-hidden />
                    <span>{label}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{index + 2}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
  // A label hidden with display: none drops out of innerText and the accessible
  // name; a visually hidden one stays in both.
  play: ({ canvasElement }) => {
    const buttons = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-sidebar="menu-button"]')
    )
    const names = buttons.map(button => button.innerText.trim())
    if (names.join('|') !== railItems.map(item => item.label).join('|')) {
      throw new Error(`Expected every rail button to keep its label, got ${names.join(', ')}`)
    }
    for (const button of buttons) {
      if (button.getBoundingClientRect().width === 0) throw new Error('Expected a visible button')
    }
  },
}

/*
 * Right-to-left: the menu action and badge sit at the inline end (the left),
 * in the room the button reserves for them, clear of the label.
 */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl" lang="ar">
      <SidebarProvider style={{ minHeight: 0, width: 'auto' }}>
        <Sidebar collapsible="none" style={{ width: '14rem' }}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>البريد</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Inbox aria-hidden />
                    <span>صندوق الوارد</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>16</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText aria-hidden />
                    <span>المسودات</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="خيارات المسودات">
                    <MoreHorizontal aria-hidden />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </UIProvider>
  ),
  play: ({ canvasElement }) => {
    for (const selector of ['[data-sidebar="menu-badge"]', '[data-sidebar="menu-action"]']) {
      const extra = canvasElement.querySelector<HTMLElement>(selector)
      const item = extra?.closest<HTMLElement>('[data-sidebar="menu-item"]')
      const label = item?.querySelector<HTMLElement>('[data-sidebar="menu-button"] > span')
      if (!extra || !item || !label) throw new Error(`Expected ${selector} with a label`)
      const box = extra.getBoundingClientRect()
      const itemBox = item.getBoundingClientRect()
      // Inline end is the left edge under dir="rtl".
      if (box.left - itemBox.left >= 8) {
        throw new Error(`Expected ${selector} at the inline end (left) under dir="rtl"`)
      }
      if (box.right > label.getBoundingClientRect().left + 0.5) {
        throw new Error(`Expected ${selector} clear of the label`)
      }
    }
  },
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

function MobileViewport({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth')
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    return () => {
      if (originalInnerWidth) Object.defineProperty(window, 'innerWidth', originalInnerWidth)
    }
  }, [])

  return children
}

function DarkSidebarPhoneDemo() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null)

  return (
    <MobileViewport>
      <UIProvider mode="light">
        <SidebarProvider style={{ minHeight: '100svh' }}>
          <UIProvider mode="dark">
            <div
              data-testid="dark-sidebar-region"
              ref={setPortalContainer}
              style={{ display: 'contents' }}
            >
              <PortalContainerProvider container={portalContainer}>
                <Sidebar aria-label="Mailboxes">
                  <SidebarHeader>
                    <span style={{ fontWeight: 600, paddingInline: 'var(--a63-space-2)' }}>
                      Mail
                    </span>
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
                            <Send aria-hidden />
                            <span>Sent</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroup>
                  </SidebarContent>
                </Sidebar>
              </PortalContainerProvider>
            </div>
          </UIProvider>
          <main
            data-testid="light-phone-app"
            style={{
              background: 'var(--a63-surface-panel)',
              color: 'var(--a63-text-primary)',
              flex: 1,
              padding: 'var(--a63-space-4)',
            }}
          >
            <SidebarTrigger aria-label="Open mailboxes" />
            <p>The inbox stays light.</p>
          </main>
        </SidebarProvider>
      </UIProvider>
    </MobileViewport>
  )
}

/** The `Phone` suffix gives this story a 390px visual-regression viewport. */
export const DarkSidebarPhone: Story = {
  render: () => <DarkSidebarPhoneDemo />,
  play: async ({ canvasElement }) => {
    const storyDocument = canvasElement.ownerDocument
    const trigger = storyDocument.querySelector<HTMLButtonElement>(
      'button[aria-label="Open mailboxes"]'
    )
    if (!trigger) throw new Error('Expected the mobile sidebar trigger')
    // The craft harness checks the closed story because a modal makes the rest
    // of its pointer target inert. Storybook and visual regression exercise it.
    if ((globalThis as { __A63_A11Y_TEST__?: string }).__A63_A11Y_TEST__ === 'off') return
    trigger.click()

    const region = storyDocument.querySelector<HTMLElement>('[data-testid="dark-sidebar-region"]')
    const app = storyDocument.querySelector<HTMLElement>('[data-testid="light-phone-app"]')
    if (!region || !app) throw new Error('Expected the dark region and light app')

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const sidebar = region.querySelector<HTMLElement>('[data-mobile="true"]')
      if (sidebar) {
        if (getComputedStyle(sidebar).color === getComputedStyle(app).color) {
          throw new Error('Expected dark-region sidebar text to differ from the light app')
        }
        return
      }
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    throw new Error('Expected the mobile sidebar inside the dark region')
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
