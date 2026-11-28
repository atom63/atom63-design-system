import { PageHeader } from '@atom63/templates'
import { Button } from '@atom63/ui-react'
import { Container, Page } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'

/* Outside the app shell, so it owns the main landmark and the page's h1. */
export function NotFoundPage() {
  return (
    <Page>
      <Container maxWidth="wide" padding="x">
        <PageHeader
          actions={<Button render={<Link to="/" />}>Go to the overview</Button>}
          description="The page may have moved, or the link has a typo."
          title="Page not found"
        />
      </Container>
    </Page>
  )
}
