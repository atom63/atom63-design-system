import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'

import { SiteLayout } from './components/site-layout'
import { HomePage } from './pages/home'
import { NotFoundPage } from './pages/not-found'
import { ProjectPage } from './pages/project-page'
import { ProjectsIndexPage } from './pages/projects-index'
import { ResumePage } from './pages/resume'
import { TimelinePage } from './pages/timeline'
import { WritingIndexPage } from './pages/writing-index'
import { WritingPostPage } from './pages/writing-post'
import { isOn } from './portfolio.config'

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

/* Every page shares the header, footer, assistant and dock through this pathless layout route. */
const siteRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'site',
  component: () => (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  ),
})

const homeRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/',
  component: HomePage,
})
const projectsRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/projects',
  component: ProjectsIndexPage,
})
const projectRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/projects/$slug',
  component: ProjectPage,
})
const writingRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/writing',
  component: WritingIndexPage,
})
const postRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/writing/$slug',
  component: WritingPostPage,
})
const timelineRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/timeline',
  component: TimelinePage,
})
const resumeRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/resume',
  component: ResumePage,
})

/* The slides module: its routes exist only when it is on in portfolio.config.ts. */
const slidesRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/slides',
  component: lazyRouteComponent(() => import('./modules/slides/slides-pages'), 'SlidesIndexPage'),
})
const deckRoute = createRoute({
  getParentRoute: () => siteRoute,
  path: '/slides/$slug',
  component: lazyRouteComponent(() => import('./modules/slides/slides-pages'), 'SlideDeckPage'),
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    siteRoute.addChildren([
      homeRoute,
      projectsRoute,
      projectRoute,
      writingRoute,
      postRoute,
      timelineRoute,
      resumeRoute,
      ...(isOn('slides') ? [slidesRoute, deckRoute] : []),
    ]),
  ]),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
