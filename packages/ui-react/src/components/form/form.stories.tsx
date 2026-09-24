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
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
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
            <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{endpoint.label}</span>
            <ProfileForm withError />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(formContract, null, 2)}
    </pre>
  ),
}
