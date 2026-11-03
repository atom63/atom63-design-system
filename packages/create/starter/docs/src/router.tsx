import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { DocsSidebar } from './components/docs-sidebar'
import { SiteFooter } from './components/site-footer'
import { type NavItem, SiteHeader } from './components/site-header'
import { docs } from './content/docs'
import { DocPage } from './pages/doc-page'
import { HomePage } from './pages/home'
import { NotFoundPage } from './pages/not-found'
import { site } from './site'

const nav: NavItem[] = [
  { label: 'Home', to: '/' },
  ...(docs[0] ? [{ label: 'Docs', to: `/docs/${docs[0].slug}` }] : []),
]

function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav={nav} title={site.title} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        <aside
          aria-label="Documentation"
          className="border-border border-b md:sticky md:top-0 md:max-h-screen md:w-64 md:shrink-0 md:self-start md:overflow-y-auto md:border-e md:border-b-0"
        >
          <DocsSidebar />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <SiteFooter title={site.title} />
    </div>
  )
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <NotFoundPage />
    </SiteLayout>
  ),
})

/*
 * The docs pages share the header, sidebar and footer through this pathless
 * layout route. A full-window page, such as an AppView, is a child of
 * rootRoute instead, so it draws no site chrome.
 */
const siteRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'site',
  component: () => (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  ),
})

const homeRoute = createRoute({ getParentRoute: () => siteRoute, path: '/', component: HomePage })
const docRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/docs/$slug',
  component: DocPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([siteRoute.addChildren([homeRoute, docRoute])]),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
