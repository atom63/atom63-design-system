import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { ChevronsUpDown } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react'

export const template = {
  id: 'app-shell',
  kind: 'block',
  title: 'App shell',
  description:
    'The frame of a product: a sidebar with the product name, the main navigation and the signed-in user at its foot (avatar, name, email or role, and an account menu), a top bar with the menu toggle, and the page as the main landmark.',
  category: 'layout',
  tags: [
    'shell',
    'sidebar',
    'navigation',
    'layout',
    'frame',
    'top bar',
    'dashboard',
    'user',
    'profile',
    'account menu',
    'avatar',
  ],
  readiness: 'ready',
} as const

export interface AppShellNavItem {
  current?: boolean
  href: string
  /** A lucide icon element, marked `aria-hidden`. */
  icon: ReactNode
  label: string
}

/** The signed-in user, shown at the foot of the sidebar. */
export interface AppShellUser {
  /** The avatar image; the initials show while it loads, or without one. */
  avatarSrc?: string
  /** A second line under the name, such as the email or the role. */
  detail?: string
  /**
   * Account actions (`DropdownMenuItem`s, `DropdownMenuSeparator`s). With
   * them, the user row opens this menu; without, it is plain text.
   */
  menu?: ReactNode
  name: string
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
  /** Actions at the end of the top bar, such as search or notifications. */
  topBarActions?: ReactNode
  /** The signed-in user at the foot of the sidebar; nothing renders without it. */
  user?: AppShellUser
}

export type AppShellLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const anchor = ({ children, ...props }: AppShellLinkProps) => <a {...props}>{children}</a>

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('')

/*
 * The user row. In the icon rail only the avatar shows; the name and detail
 * stay in the accessibility tree, hidden visually. The avatar is decorative:
 * the name beside it says who it is.
 */
function UserRow({ user }: { user: AppShellUser }) {
  const avatar = (
    <Avatar aria-hidden>
      {user.avatarSrc && <AvatarImage alt="" src={user.avatarSrc} />}
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  )
  const text = (
    <span className="flex min-w-0 flex-1 flex-col text-start leading-tight in-data-[collapsible=icon]:sr-only">
      <span className="text-foreground truncate font-medium">{user.name}</span>
      {user.detail && <span className="text-muted-foreground truncate text-xs">{user.detail}</span>}
    </span>
  )
  if (!user.menu) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm in-data-[collapsible=icon]:justify-center in-data-[collapsible=icon]:p-0">
        {avatar}
        {text}
      </div>
    )
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg">
                {avatar}
                {text}
                <span className="ms-auto">
                  <ChevronsUpDown aria-hidden className="size-4" />
                </span>
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent align="start" side="top">
            {user.menu}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

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
  user,
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
        {/* The account sits in its own landmark at the sidebar's foot. */}
        {user && (
          <SidebarFooter aria-label="Account" role="region">
            <UserRow user={user} />
          </SidebarFooter>
        )}
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
