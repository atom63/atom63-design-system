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
  Dialog,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type CSSProperties, type ReactNode, type RefObject, useRef } from 'react'

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

/*
 * A fixed-height box that holds one open overlay. The transform makes the box
 * the containing block of the popup's fixed-position backdrop and viewport, and
 * --a63-viewport-height sizes them to the box, so the overlay lays out as it
 * would over a short window.
 */
function OverlayStage({
  children,
  height = 320,
}: {
  children: (container: RefObject<HTMLDivElement | null>) => ReactNode
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={containerRef}
      style={
        {
          '--a63-viewport-height': `${height}px`,
          background: 'var(--a63-surface-page)',
          blockSize: height,
          borderRadius: 'var(--radius-lg)',
          color: 'var(--a63-text-primary)',
          overflow: 'hidden',
          position: 'relative',
          transform: 'translateZ(0)',
        } as CSSProperties
      }
    >
      {children(containerRef)}
    </div>
  )
}

/*
 * One alert dialog popup, open on load inside a stage, for the matrix stories.
 * An alert dialog is always modal, and two open modal dialogs each hide the
 * other from assistive tech, so these cells mount the same AlertDialogPopup
 * under a non-modal Dialog root (the alert dialog root is a Dialog root with
 * `modal` forced on). The Confirm story shows the real modal alert dialog.
 */
function StagedAlert({
  label,
  variant,
}: {
  label: string
  variant: (typeof alertDialogVariants)[number]
}) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>{label}</span>
      <OverlayStage>
        {container => (
          <Dialog defaultOpen modal={false}>
            <AlertDialogPopup initialFocus={false} portalProps={{ container }} variant={variant}>
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
          </Dialog>
        )}
      </OverlayStage>
    </div>
  )
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
    <AlertDialog defaultOpen>
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

/** Every semantic popup variant, open. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      {alertDialogVariants.map(variant => (
        <StagedAlert key={variant} label={variant} variant={variant} />
      ))}
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={theme + mode} mode={mode} theme={theme}>
            <StagedAlert label={`${theme} / ${mode}`} variant="destructive" />
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same confirmation pattern reviewed against target host contexts. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
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
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <StagedAlert label={endpoint.label} variant="destructive" />
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
