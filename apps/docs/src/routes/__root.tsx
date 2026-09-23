import { Toaster } from '@atom63/ui-react'
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { DocProviders } from '../components/doc-providers'
import { Layout } from '../components/layout'
import { usePageMeta } from '../hooks/use-page-meta'
import { resolveDocTarget } from '../lib/doc-routing'
import { ThemeProvider } from '../theme'

export const Route = createRootRoute({
  component: RootRoute,
})

function RootRoute() {
  const location = useLocation()
  const [, area, slug] = location.pathname.split('/')
  const activeTarget = resolveDocTarget(area, slug)

  return (
    <ThemeProvider>
      <DocDevHooks />
      <DocProviders>
        <Layout activeArea={activeTarget.area} activeSection={activeTarget.slug}>
          <Outlet />
        </Layout>
      </DocProviders>
      <Toaster closeButton={false} position="bottom-right" />
    </ThemeProvider>
  )
}

function DocDevHooks() {
  usePageMeta()

  return null
}
