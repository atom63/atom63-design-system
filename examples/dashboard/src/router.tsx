import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'

import { AppLayout } from './components/app-layout'
import { AccountsPage } from './pages/accounts'
import { NotFoundPage } from './pages/not-found'
import { OverviewPage } from './pages/overview'
import { SettingsPage } from './pages/settings'
import { type DataState, parseDataState } from './store'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  ),
  notFoundComponent: NotFoundPage,
  // `?state=loading|empty|error` forces a data state on every page.
  validateSearch: (search: Record<string, unknown>): { state?: DataState } => {
    const state = parseDataState(search.state)
    return state ? { state } : {}
  },
})

const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  component: AppLayout,
})

const overviewRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  component: OverviewPage,
})

export interface AccountsSearch {
  /** The account open in the detail sheet. */
  account?: string
  page?: number
}

export const accountsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/accounts',
  component: AccountsPage,
  validateSearch: (search: Record<string, unknown>): AccountsSearch => {
    const page = Number(search.page)
    return {
      ...(typeof search.account === 'string' && { account: search.account }),
      ...(Number.isInteger(page) && page > 1 && { page }),
    }
  },
})

const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings',
  component: SettingsPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    shellRoute.addChildren([overviewRoute, accountsRoute, settingsRoute]),
  ]),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
