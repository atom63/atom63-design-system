import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@atom63/ui-react'
import type { ReactNode } from 'react'

export const template = {
  id: 'auth-card',
  kind: 'block',
  title: 'Auth card',
  description:
    'A centered card for signing in or up: the product name as the page heading, one short line of context, the form, and the way to the other flow.',
  category: 'forms',
  tags: ['sign in', 'login', 'sign up', 'register', 'auth', 'password', 'form'],
  readiness: 'draft',
} as const

export interface AuthCardProps {
  children: ReactNode
  description: string
  /** The way to the other flow, for example "No account? Create one". */
  footer?: ReactNode
  title: string
}

/* Title, description, form and footer share one start edge inside the card. */
export function AuthCard({ children, description, footer, title }: AuthCardProps) {
  return (
    <Card className="mx-auto w-full max-w-sm" padding="none">
      <CardContent className="flex flex-col gap-6" padding="lg">
        <div className="flex flex-col gap-1">
          {/* eslint-disable-next-line jsx-a11y/heading-has-content -- CardTitle renders the title inside the h1. */}
          <CardTitle className="font-heading text-2xl" lineClamp={undefined} render={<h1 />}>
            {title}
          </CardTitle>
          <CardDescription lineClamp={undefined}>{description}</CardDescription>
        </div>
        {children}
      </CardContent>
      {footer ? (
        <CardFooter className="text-muted-foreground text-sm" padding="lg">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  )
}
