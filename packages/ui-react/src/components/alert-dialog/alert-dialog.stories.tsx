import { alertDialogContract, alertDialogVariants, themes } from '@atom63/ui-foundation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/AlertDialog',
  component: AlertDialog,
  decorators: [
    Story => (
      <div style={{ display: 'flex', gap: 24, padding: 48 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

function VariantIcon({ variant }: { variant: (typeof alertDialogVariants)[number] }) {
  if (variant === 'success') {
    return <CheckCircle2 aria-hidden />
  }
  if (variant === 'default' || variant === 'info') {
    return <Info aria-hidden />
  }
  return <AlertTriangle aria-hidden />
}

export const Playground: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline">Delete project</Button>} />
      <AlertDialogPopup variant="destructive">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <VariantIcon variant="destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the project and all of its files. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  ),
}

export const Confirm: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="primary">Publish</Button>} />
      <AlertDialogPopup size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <VariantIcon variant="default" />
          </AlertDialogMedia>
          <AlertDialogTitle>Publish changes?</AlertDialogTitle>
          <AlertDialogDescription>Your changes will go live immediately.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction variant="primary">Publish</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  ),
}

/** Every semantic popup variant, each opened from its own trigger. */
export const Variants: Story = {
  render: () => (
    <>
      {alertDialogVariants.map(variant => (
        <AlertDialog key={variant}>
          <AlertDialogTrigger render={<Button variant="outline">{variant}</Button>} />
          <AlertDialogPopup variant={variant}>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <VariantIcon variant={variant} />
              </AlertDialogMedia>
              <AlertDialogTitle>{variant} alert</AlertDialogTitle>
              <AlertDialogDescription>
                This popup uses the “{variant}” variant to carry its semantic tone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant={variant === 'destructive' ? 'destructive' : 'primary'}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>
      ))}
    </>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={theme + mode} mode={mode} theme={theme}>
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
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="outline">Delete project</Button>} />
                <AlertDialogPopup variant="destructive">
                  <AlertDialogHeader>
                    <AlertDialogMedia>
                      <VariantIcon variant="destructive" />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the project and all of its files.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogPopup>
              </AlertDialog>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same confirmation pattern reviewed against target host contexts. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' },
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' },
        },
        {
          label: 'Compact extension',
          props: { density: 'compact', designLanguage: 'web', input: 'pointer', surface: 'n2' },
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'center',
              background: 'var(--a63-surface-panel)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              padding: '0.75rem',
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{endpoint.label}</span>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline">Delete project</Button>} />
              <AlertDialogPopup variant="destructive">
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <VariantIcon variant="destructive" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the project and all of its files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogPopup>
            </AlertDialog>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(alertDialogContract, null, 2)}
    </pre>
  ),
}
