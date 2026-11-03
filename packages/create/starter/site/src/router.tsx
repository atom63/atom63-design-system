import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { SiteFooter } from './components/site-footer'
import { type NavItem, SiteHeader } from './components/site-header'
import { BlogIndexPage } from './pages/blog-index'
import { BlogPostPage } from './pages/blog-post'
import { HomePage } from './pages/home'
import { NotFoundPage } from './pages/not-found'
import { site } from './site'

const nav: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/blog' },
]

function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav={nav} title={site.title} />
      <div className="flex-1">{children}</div>
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
 * The site pages share the header and footer through this pathless layout
 * route. A full-window page, such as an AppView, is a child of rootRoute
 * instead, so it draws no site chrome.
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
const blogRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/blog',
  component: BlogIndexPage,
})
const postRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/blog/$slug',
  component: BlogPostPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([siteRoute.addChildren([homeRoute, blogRoute, postRoute])]),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
