import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'

import { AppLayout } from './components/app-layout'
import { NotFoundPage } from './pages/not-found'
import { DashboardContent } from './templates/pages/dashboard-page/dashboard-page'
import { ListContent } from './templates/pages/list-page/list-page'
import { OnboardingContent } from './templates/pages/onboarding-page/onboarding-page'
import { SettingsContent } from './templates/pages/settings-page/settings-page'
import { SignInPage } from './templates/pages/sign-in-page/sign-in-page'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  ),
  notFoundComponent: NotFoundPage,
})

/* The signed-in pages share the app shell through this pathless layout route. */
const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  component: AppLayout,
})

const overviewRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  component: DashboardContent,
})
const invoicesRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/invoices',
  component: () => <ListContent />,
})
const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings',
  component: SettingsContent,
})
const welcomeRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/welcome',
  component: OnboardingContent,
})

/* Sign-in sits outside the shell. The page is the template's; wire it to your auth. */
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: () => <SignInPage />,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    shellRoute.addChildren([overviewRoute, invoicesRoute, settingsRoute, welcomeRoute]),
    signInRoute,
  ]),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
