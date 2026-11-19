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
import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react'

export const template = {
  id: 'app-shell',
  kind: 'block',
  title: 'App shell',
  description:
    'The frame of a product: a sidebar with the product name and main navigation, a top bar with the menu toggle, and the page as the main landmark.',
  category: 'layout',
  tags: ['shell', 'sidebar', 'navigation', 'layout', 'frame', 'top bar', 'dashboard'],
  readiness: 'ready',
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
  /**
   * Renders a navigation link, for a router's own link component; a plain
   * anchor by default. It receives the anchor's props, `href` included.
   */
  renderLink?: (props: AppShellLinkProps) => ReactElement
  /** Actions at the end of the top bar, such as an account menu. */
  topBarActions?: ReactNode
}

export type AppShellLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const anchor = ({ children, ...props }: AppShellLinkProps) => <a {...props}>{children}</a>

/*
 * On a phone the sidebar becomes a sheet the top-bar toggle opens; on wider
 * screens it collapses to icons. The current page is marked with
 * `aria-current`, not only the active style.
 *
 * Each safe-area inset has one owner, as in AppView: the top bar takes the top
 * inset, the page wrapper the bottom one, and both clear the inline insets
 * (the larger of the two, so the layout still mirrors).
 */
export function AppShell({
  children,
  homeHref,
  navItems,
  productName,
  renderLink = anchor,
  topBarActions,
}: AppShellProps) {
  return (
    <SidebarProvider className="[--app-shell-inset-inline:max(var(--a63-safe-area-left),var(--a63-safe-area-right))]">
      <Sidebar collapsible="icon">
        {/* One navigation landmark holds the product name and the menu, so all
            sidebar content sits in a landmark; `contents` keeps the sidebar's
            own layout. */}
        <nav aria-label="Main" className="contents">
          <SidebarHeader>
            {renderLink({
              children: productName,
              className: 'font-heading text-foreground truncate px-2 font-semibold',
              href: homeHref ?? navItems[0]?.href ?? '#',
            })}
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
                        render={renderLink({
                          'aria-current': item.current ? 'page' : undefined,
                          children: (
                            <>
                              {item.icon}
                              <span>{item.label}</span>
                            </>
                          ),
                          href: item.href,
                        })}
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
        <header className="border-border box-content flex h-14 items-center gap-2 border-b px-[max(--spacing(4),var(--app-shell-inset-inline))] pt-[var(--a63-safe-area-top)]">
          <SidebarTrigger />
          <div className="ms-auto flex items-center gap-2">{topBarActions}</div>
        </header>
        <div className="px-[max(--spacing(4),var(--app-shell-inset-inline))] pt-8 pb-[calc(--spacing(8)+var(--a63-safe-area-bottom))] sm:px-[max(--spacing(6),var(--app-shell-inset-inline))]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
