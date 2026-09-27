import {
  DashboardPage,
  ListPage,
  OnboardingPage,
  SettingsPage,
  SignInPage,
} from '@atom63/templates'
import { Atom63Theme } from '@atom63/ui-react'
import { type ReactElement, useEffect, useState } from 'react'

/*
 * The example app is composed only from @atom63/templates pages. Each route is
 * a hash, which is also what the templates' navigation links point at, so the
 * app needs no router dependency. check:product-shell visits every route.
 */
const routes: Record<string, { page: () => ReactElement; title: string }> = {
  overview: { page: () => <DashboardPage />, title: 'Overview' },
  invoices: { page: () => <ListPage />, title: 'Invoices' },
  settings: { page: () => <SettingsPage />, title: 'Settings' },
  welcome: { page: () => <OnboardingPage />, title: 'Welcome' },
  'sign-in': { page: () => <SignInPage />, title: 'Sign in' },
}

const DEFAULT_ROUTE = 'overview'

const darkQuery = '(prefers-color-scheme: dark)'

/* Follows the OS setting; a product would also let people choose. */
function usePreferredMode() {
  const [dark, setDark] = useState(() => window.matchMedia(darkQuery).matches)
  useEffect(() => {
    const query = window.matchMedia(darkQuery)
    const onChange = () => setDark(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return dark ? 'dark' : 'light'
}

const currentRoute = () => {
  const hash = window.location.hash.replace(/^#/, '')
  return hash in routes ? hash : DEFAULT_ROUTE
}

export function App() {
  const [route, setRoute] = useState(currentRoute)
  const mode = usePreferredMode()

  useEffect(() => {
    const onHashChange = () => {
      setRoute(currentRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const { page, title } = routes[route] ?? routes[DEFAULT_ROUTE]
  useEffect(() => {
    document.title = `${title} · Tally`
  }, [title])

  return (
    <Atom63Theme className="bg-background text-foreground min-h-svh" mode={mode}>
      {page()}
    </Atom63Theme>
  )
}
