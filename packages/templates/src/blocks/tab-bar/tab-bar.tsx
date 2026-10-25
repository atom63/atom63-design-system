import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react'

export const template = {
  id: 'tab-bar',
  kind: 'block',
  title: 'Tab bar',
  description:
    'The bottom navigation of a phone app: four or five destinations as an icon over a label, with the safe-area inset, the current one marked with aria-current. The app-view page places it last on phones.',
  category: 'layout',
  tags: ['tab bar', 'bottom navigation', 'mobile', 'phone', 'app', 'navigation', 'bottom bar'],
  readiness: 'draft',
} as const

export interface TabBarItem {
  current?: boolean
  href: string
  /** A lucide icon element, marked `aria-hidden`. */
  icon: ReactNode
  label: string
}

export type TabBarLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export interface TabBarProps {
  /** The navigation landmark's name. */
  label?: string
  items: readonly TabBarItem[]
  /**
   * Renders a destination link, for a router's own link component; a plain
   * anchor by default. It receives the anchor's props, `href` included.
   */
  renderLink?: (props: TabBarLinkProps) => ReactElement
}

const anchor = ({ children, ...props }: TabBarLinkProps) => <a {...props}>{children}</a>

/*
 * A navigation landmark for the bottom of a phone layout. The layout places it
 * (the app-view page's tabBar slot puts it last on phones); it is not fixed, so
 * it never covers content. On iOS the same intent is SwiftUI's TabView; this
 * block is the web side. Each destination is a link at least 56px tall, and the
 * current one carries aria-current, not only the accent color.
 */
export function TabBar({ items, label = 'Main', renderLink = anchor }: TabBarProps) {
  return (
    <nav
      aria-label={label}
      className="border-border bg-background border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-lg">
        {items.map(item => (
          <li className="flex-1" key={item.href}>
            {renderLink({
              'aria-current': item.current ? 'page' : undefined,
              children: (
                <>
                  <span className="[&>svg]:size-6">{item.icon}</span>
                  <span>{item.label}</span>
                </>
              ),
              className: `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
                item.current ? 'text-selected-foreground' : 'text-muted-foreground'
              }`,
              href: item.href,
            })}
          </li>
        ))}
      </ul>
    </nav>
  )
}
