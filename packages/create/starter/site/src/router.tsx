import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'

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

const rootRoute = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col">
      <ScrollRestoration />
      <SiteHeader nav={nav} title={site.title} />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter title={site.title} />
    </div>
  ),
  notFoundComponent: NotFoundPage,
})

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })
const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog',
  component: BlogIndexPage,
})
const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/$slug',
  component: BlogPostPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute, blogRoute, postRoute]),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
