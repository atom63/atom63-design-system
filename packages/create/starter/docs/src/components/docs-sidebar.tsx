import {
  Sidebar,
  SidebarContent,
  SidebarNavGroup,
  SidebarNavLinkItem,
  SidebarProvider,
} from '@atom63/ui-react'
import { Link, useRouterState } from '@tanstack/react-router'

import { groups } from '../content/docs'

/** Navigation built from the content folder: one group per `group`, one link per page. */
export function DocsSidebar() {
  const pathname = useRouterState({ select: state => state.location.pathname })
  return (
    <SidebarProvider className="min-h-0 w-auto">
      {/* Transparent, so the column reads as part of the page rather than a panel. */}
      <Sidebar className="bg-transparent" collapsible="none">
        <SidebarContent>
          {groups.map(group => (
            <SidebarNavGroup key={group.name} label={group.name}>
              {group.docs.map(doc => (
                <SidebarNavLinkItem isActive={pathname === `/docs/${doc.slug}`} key={doc.slug}>
                  <Link params={{ slug: doc.slug }} to="/docs/$slug">
                    {doc.title}
                  </Link>
                </SidebarNavLinkItem>
              ))}
            </SidebarNavGroup>
          ))}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
