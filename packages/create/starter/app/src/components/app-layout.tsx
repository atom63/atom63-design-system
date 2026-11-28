import { DropdownMenuItem } from '@atom63/ui-react'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { FileText, LayoutDashboard, Settings } from 'lucide-react'

import { app } from '../app'
import { AppShell, type AppShellLinkProps } from '../templates/blocks/app-shell/app-shell'
import { AppearanceControls } from '../theme'

const nav = [
  { href: '/', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
  { href: '/invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
  { href: '/settings', icon: <Settings aria-hidden />, label: 'Settings' },
]

/* The signed-in user at the foot of the sidebar. Replace it with the session's
   user, and the menu with the app's account actions. */
const user = {
  detail: 'you@example.com',
  menu: <DropdownMenuItem>Sign out</DropdownMenuItem>,
  name: 'Your name',
}

/* The shell's links go through the router, so navigating keeps the shell. */
const routerLink = ({ href, ...props }: AppShellLinkProps) => <Link to={href} {...props} />

/*
 * The app shell, rendered once around every signed-in page. Each route
 * renders a template's content (DashboardContent, ListContent, …) inside it.
 */
export function AppLayout() {
  const { pathname } = useLocation()
  return (
    <AppShell
      navItems={nav.map(item => ({ ...item, current: item.href === pathname }))}
      productName={app.title}
      renderLink={routerLink}
      user={user}
      topBarActions={
        // Two rows of switches would not fit a phone's top bar; there the app
        // keeps the stored or system appearance.
        <div className="hidden sm:block">
          <AppearanceControls />
        </div>
      }
    >
      <Outlet />
    </AppShell>
  )
}
