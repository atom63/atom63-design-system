import { createFileRoute, useLocation } from '@tanstack/react-router'
import { DocsPage } from '../components/docs-page'

export const Route = createFileRoute('/$area')({
  component: AreaRoute,
})

function AreaRoute() {
  const { area } = Route.useParams()
  const location = useLocation()
  const [, , slug] = location.pathname.split('/')

  return <DocsPage area={area} slug={slug} />
}
