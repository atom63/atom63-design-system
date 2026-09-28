import { Link } from '@tanstack/react-router'

import { AppearanceControls } from '../theme'

export type NavItem = { label: string; to: string }

export function SiteHeader({ nav, title }: { nav: NavItem[]; title: string }) {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link className="font-semibold" to="/">
            {title}
          </Link>
          <nav aria-label="Main" className="flex items-center gap-4 text-sm">
            {nav.map(item => (
              <Link
                activeProps={{ 'aria-current': 'page', className: 'text-foreground' }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <AppearanceControls />
      </div>
    </header>
  )
}
