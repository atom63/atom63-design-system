import { formContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'

const meta = {
  title: 'UI React/Form',
  component: Form,
} satisfies Meta<typeof Form>

export default meta
// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

type Values = { email: string }

function ProfileForm({ withError }: { withError?: boolean }) {
  const methods = useForm<Values>({
    defaultValues: { email: '' },
    errors: withError
      ? { email: { type: 'manual', message: 'Enter a valid email address.' } }
      : undefined,
  })

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(() => {})}
        style={{ display: 'grid', gap: 20, maxWidth: 360 }}
      >
        <FormField
          control={methods.control}
          name="email"
          rules={{ required: 'Email is required.' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@atom63.io" type="email" {...field} />
              </FormControl>
              <FormDescription>We use this to send release notes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}

export const Playground: Story = {
  render: () => <ProfileForm />,
}

/* The error state: label recolors, control is aria-invalid, message appears. */
export const WithError: Story = {
  render: () => <ProfileForm withError />,
}

/* Every DS theme × light/dark, each rendering the error state so the label
 * recolor + message tokens are visible across all palettes. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.75rem',
                background: 'var(--a63-surface-panel)',
                color: 'var(--a63-text-primary)',
                borderRadius: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <ProfileForm withError />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: { density: 'compact', designLanguage: 'web', input: 'pointer' } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'flex-start',
              background: 'var(--a63-surface-panel)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              padding: 12,
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
              {endpoint.label}
            </span>
            <ProfileForm withError />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

const LONG_DESCRIPTION =
  'Wir senden Ihnen Versionshinweise und Sicherheitsbenachrichtigungen 我们只会发送版本说明 https://atom63.io/notificationpreferencesreleasenotessecurityadvisoriesproductupdates'
const LONG_ERROR =
  'Diese E-Mail-Adresse ist ungültig oder bereits registriert 此邮箱无效 https://atom63.io/helpaccountswhywasmyemailaddressrejectedduringsignupflow'

function MessageForm({
  description,
  error,
  label,
}: {
  description: string
  error: string
  label: string
}) {
  const methods = useForm<Values>({
    defaultValues: { email: '' },
    errors: { email: { type: 'manual', message: error } },
  })
  return (
    <Form {...methods}>
      <form style={{ display: 'grid', gap: 20, maxWidth: 320 }}>
        <FormField
          control={methods.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input placeholder="you@atom63.io" type="email" {...field} />
              </FormControl>
              <FormDescription>{description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

/* Right to left, then a long German, CJK and unbroken-URL description and
   error: the message wraps inside the column instead of widening the form. */
export const RightToLeftAndLongText: Story = {
  render: () => (
    <div data-testid="long" style={{ display: 'grid', gap: 24, maxWidth: 320 }}>
      <UIProvider dir="rtl">
        <MessageForm
          description="نستخدم هذا العنوان لإرسال ملاحظات الإصدار."
          error="أدخل عنوان بريد إلكتروني صالحًا."
          label="البريد الإلكتروني"
        />
      </UIProvider>
      <MessageForm
        description={LONG_DESCRIPTION}
        error={LONG_ERROR}
        label="E-Mail-Adresse für Benachrichtigungen 电子邮件"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('[data-testid="long"]')
    if (!frame) throw new Error('No frame')
    const column = frame.getBoundingClientRect()
    const parts = frame.querySelectorAll(
      '[data-slot="form-description"], [data-slot="form-message"]'
    )
    if (parts.length !== 4) throw new Error(`Expected 4 messages, found ${parts.length}`)
    for (const part of parts) {
      const box = part.getBoundingClientRect()
      if (
        box.right > column.right + 1 ||
        box.left < column.left - 1 ||
        part.scrollWidth > part.clientWidth + 1
      )
        throw new Error(`${part.getAttribute('data-slot')} overflows the column`)
    }
  },
}

/* While the form submits: the fields are disabled and the submit Button shows
   its loading state (it keeps focus and blocks a second submit). */
function SubmittingForm() {
  const methods = useForm<Values>({ defaultValues: { email: 'ada@atom63.io' } })
  return (
    <Form {...methods}>
      <form aria-busy="true" style={{ display: 'grid', gap: 20, maxWidth: 360 }}>
        <FormField
          control={methods.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled placeholder="you@atom63.io" type="email" {...field} />
              </FormControl>
              <FormDescription>We use this to send release notes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button loading type="submit">
          Save
        </Button>
      </form>
    </Form>
  )
}

export const Submitting: Story = {
  render: () => <SubmittingForm />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input')
    const button = canvasElement.querySelector('button[type="submit"]')
    if (!input?.disabled) throw new Error('The field is not disabled while submitting')
    if (button?.getAttribute('aria-busy') !== 'true')
      throw new Error('The submit button does not show its loading state')
  },
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(formContract, null, 2)}
    </pre>
  ),
}
