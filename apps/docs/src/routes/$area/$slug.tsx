import { createFileRoute } from '@tanstack/react-router'
import { DocsPage } from '../../components/docs-page'

export const Route = createFileRoute('/$area/$slug')({
  component: AreaSlugRoute,
})

function AreaSlugRoute() {
  const { area, slug } = Route.useParams()

  return <DocsPage area={area} slug={slug} />
}
