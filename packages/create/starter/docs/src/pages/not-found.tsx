import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@atom63/ui-react'
import { Container, Page } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <Page>
      <Container maxWidth="narrow">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Page not found</EmptyTitle>
            <EmptyDescription>
              The page you are looking for does not exist or has moved.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to="/" />}>Go home</Button>
          </EmptyContent>
        </Empty>
      </Container>
    </Page>
  )
}
