import { createFileRoute } from '@tanstack/react-router'
import { DocsPage } from '../components/docs-page'

export const Route = createFileRoute('/')({
  component: IndexRoute,
})

function IndexRoute() {
  return <DocsPage area="architecture" slug="home" />
}
