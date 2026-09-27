import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Checkbox,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@atom63/ui-react'
import { Page } from '@atom63/ui-react/layout'
import { AlertCircle } from 'lucide-react'
import { type FormEvent, useId, useRef, useState } from 'react'

import { AuthCard } from '../../blocks/auth-card/auth-card'

export const template = {
  id: 'sign-in-page',
  kind: 'page',
  title: 'Sign-in page',
  description:
    'Email and password sign-in with inline field errors, a form-level error for wrong credentials, a loading submit, and links to reset the password or create an account.',
  category: 'forms',
  tags: ['sign in', 'login', 'auth', 'password', 'form', 'validation'],
  readiness: 'draft',
} as const

export interface SignInPageProps {
  /**
   * Checks the credentials; resolve `false` for a wrong password. The template
   * accepts any password except "wrong" so every state can be tried.
   */
  onSignIn?: (email: string, password: string) => Promise<boolean>
}

const demoSignIn = (_email: string, password: string) =>
  new Promise<boolean>(resolve => setTimeout(() => resolve(password !== 'wrong'), 600))

const linkClass =
  'font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground'

export function SignInPage({ onSignIn = demoSignIn }: SignInPageProps) {
  const emailId = useId()
  const emailErrorId = useId()
  const passwordId = useId()
  const rememberId = useId()
  const emailRef = useRef<HTMLInputElement>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formError, setFormError] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = (data.get('email') as string | null)?.trim() ?? ''
    const password = (data.get('password') as string | null) ?? ''
    setFormError(false)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError(
        email === '' ? 'Enter your email address.' : 'Enter an email address like name@example.com.'
      )
      emailRef.current?.focus()
      return
    }
    setEmailError(null)
    setPending(true)
    const ok = await onSignIn(email, password)
    setPending(false)
    if (!ok) setFormError(true)
  }

  return (
    <Page className="flex items-center px-4">
      <AuthCard
        description="Sign in to manage your invoices."
        footer={
          <p>
            No account yet?{' '}
            <a className={linkClass} href="#sign-up">
              Create one
            </a>
          </p>
        }
        title="Tally"
      >
        <form noValidate onSubmit={event => void submit(event)}>
          <FieldGroup>
            {formError ? (
              <Alert variant="error">
                <AlertIcon>
                  <AlertCircle aria-hidden />
                </AlertIcon>
                <AlertTitle>That email and password do not match</AlertTitle>
                <AlertDescription>
                  Check them and try again, or reset your password.
                </AlertDescription>
              </Alert>
            ) : null}
            <Field data-invalid={emailError ? true : undefined}>
              <FieldLabel htmlFor={emailId}>Email</FieldLabel>
              <Input
                aria-describedby={emailError ? emailErrorId : undefined}
                aria-invalid={emailError ? true : undefined}
                autoComplete="email"
                id={emailId}
                name="email"
                ref={emailRef}
                type="email"
              />
              {emailError ? <FieldError id={emailErrorId}>{emailError}</FieldError> : null}
            </Field>
            <Field>
              <div className="flex items-baseline justify-between gap-4">
                <FieldLabel htmlFor={passwordId}>Password</FieldLabel>
                <a className={`${linkClass} text-sm`} href="#reset-password">
                  Forgot password?
                </a>
              </div>
              <Input
                autoComplete="current-password"
                id={passwordId}
                name="password"
                type="password"
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox id={rememberId} name="remember" />
              <FieldLabel htmlFor={rememberId}>Keep me signed in</FieldLabel>
            </Field>
            <Button className="w-full" loading={pending} type="submit" variant="primary">
              Sign in
            </Button>
          </FieldGroup>
        </form>
      </AuthCard>
    </Page>
  )
}
