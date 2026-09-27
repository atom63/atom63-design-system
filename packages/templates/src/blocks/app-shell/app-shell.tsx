import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@atom63/ui-react'
import type { ReactNode } from 'react'

export const template = {
  id: 'app-shell',
  kind: 'block',
  title: 'App shell',
  description:
    'The frame of a product: a sidebar with the product name and main navigation, a top bar with the menu toggle, and the page as the main landmark.',
  category: 'layout',
  tags: ['shell', 'sidebar', 'navigation', 'layout', 'frame', 'top bar', 'dashboard'],
  readiness: 'draft',
} as const

export interface AppShellNavItem {
  current?: boolean
  href: string
  /** A lucide icon element, marked `aria-hidden`. */
  icon: ReactNode
  label: string
}

export interface AppShellProps {
  /** The page. The shell renders the `main` landmark, so pages inside it do not add `Page`. */
  children: ReactNode
  /** Where the product name links; the first navigation item by default. */
  homeHref?: string
  navItems: readonly AppShellNavItem[]
  productName: string
  /** Actions at the end of the top bar, such as an account menu. */
  topBarActions?: ReactNode
}

/*
 * On a phone the sidebar becomes a sheet the top-bar toggle opens; on wider
 * screens it collapses to icons. The current page is marked with
 * `aria-current`, not only the active style.
 */
export function AppShell({
  children,
  homeHref,
  navItems,
  productName,
  topBarActions,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* One navigation landmark holds the product name and the menu, so all
            sidebar content sits in a landmark; `contents` keeps the sidebar's
            own layout. */}
        <nav aria-label="Main" className="contents">
          <SidebarHeader>
            <a
              className="font-heading text-foreground truncate px-2 font-semibold"
              href={homeHref ?? navItems[0]?.href ?? '#'}
            >
              {productName}
            </a>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map(item => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={item.current}
                        // With `render`, the anchor carries the content: the button drops its children.
                        render={
                          <a aria-current={item.current ? 'page' : undefined} href={item.href}>
                            {item.icon}
                            <span>{item.label}</span>
                          </a>
                        }
                        tooltip={item.label}
                      />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </nav>
      </Sidebar>
      <SidebarInset>
        <header className="border-border flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="ms-auto flex items-center gap-2">{topBarActions}</div>
        </header>
        <div className="px-4 py-8 sm:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
