import { themes, toasterContract } from '@atom63/ui-foundation'
import { Button, PortalContainerProvider, Toaster, toast, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type CSSProperties, type ComponentProps, useEffect, useState } from 'react'

import { repeatedLandmarks } from '../story-probes'

const meta = {
  title: 'UI React/Toaster',
  component: Toaster,
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
    variant: { control: 'inline-radio', options: toasterContract.variants },
  },
  args: { position: 'bottom-right' },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/*
 * Raises one toast per contract tone when it mounts (and dismisses them when it
 * unmounts), so a capture shows every tone. The toasts stay until dismissed.
 * `toasterId` sends them to one host when a story mounts several.
 */
function RaiseTones({ toasterId, withAction }: { toasterId?: string; withAction?: boolean }) {
  useEffect(() => {
    const prefix = toasterId ?? 'tones'
    const options = (tone: string) => ({ duration: Infinity, id: `${prefix}-${tone}`, toasterId })
    toast('Theme draft saved', options('default'))
    toast.info('Tokens reloaded', options('info'))
    toast.success('Page copied as Markdown', options('success'))
    toast.warning('Unsaved theme changes', options('warning'))
    toast.error('Failed to copy to clipboard', {
      ...options('error'),
      ...(withAction && {
        action: { label: 'Retry', onClick: () => {} },
        description: 'The clipboard is not available in this frame.',
      }),
    })
    toast.loading('Publishing tokens…', options('loading'))
    return () => {
      for (const tone of ['default', 'info', 'success', 'warning', 'error', 'loading']) {
        toast.dismiss(`${prefix}-${tone}`)
      }
    }
  }, [toasterId, withAction])
  return null
}

type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

/*
 * A labelled, fixed-height box that holds one host. The transform makes the box
 * the containing block of Sonner's fixed-position list, so the toasts stack
 * inside the box rather than at the window edge, and several hosts share one
 * capture. The host shows every toast (`expand`).
 */
function ToastStage({
  height = 460,
  label,
  providerProps,
  toasterId,
  toasterProps,
  withAction,
}: {
  height?: number
  label: string
  providerProps?: ProviderProps
  toasterId: string
  toasterProps?: ComponentProps<typeof Toaster>
  withAction?: boolean
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  return (
    <UIProvider {...providerProps}>
      <div
        style={{
          background: 'var(--a63-surface-panel)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--a63-text-primary)',
          display: 'grid',
          gap: 6,
          padding: 12,
        }}
      >
        <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
        <div
          ref={setContainer}
          style={{
            background: 'var(--a63-surface-page)',
            blockSize: height,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            position: 'relative',
            transform: 'translateZ(0)',
          }}
        >
          <PortalContainerProvider container={container}>
            <Toaster
              expand
              id={toasterId}
              position="bottom-right"
              visibleToasts={6}
              {...toasterProps}
            />
          </PortalContainerProvider>
          {container ? <RaiseTones toasterId={toasterId} withAction={withAction} /> : null}
        </div>
      </div>
    </UIProvider>
  )
}

/*
 * One Toaster per app, mounted at the root. The story raises a toast per tone on
 * load, so the capture has content; the buttons raise more.
 */
export const Playground: Story = {
  render: args => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.success('Page copied as Markdown')} variant="outline">
        Success
      </Button>
      <Button onClick={() => toast.error('Failed to copy to clipboard')} variant="outline">
        Error
      </Button>
      <Button onClick={() => toast.info('Tokens reloaded')} variant="outline">
        Info
      </Button>
      <Button onClick={() => toast.warning('Unsaved theme changes')} variant="outline">
        Warning
      </Button>
      <RaiseTones />
      <Toaster expand visibleToasts={6} {...args} />
    </div>
  ),
}

/* Playground in dark mode. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...Playground, globals: { mode: 'dark' } }

/* Every tone across all four themes x light/dark, one host per cell. Each host
   is a Notifications region, repeated by design. */
export const Themes: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(auto-fit, minmax(26rem, 1fr))',
        inlineSize: '100%',
      }}
    >
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ToastStage
            key={`${theme}-${mode}`}
            label={`${theme} / ${mode}`}
            providerProps={{ mode, theme }}
            toasterId={`themes-${theme}-${mode}`}
          />
        ))
      )}
    </div>
  ),
}

/*
 * The interactive states: an error toast with a description and an action, every
 * toast with its close button, and keyboard focus on the front toast.
 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      <ToastStage
        height={560}
        label="action, close button, keyboard focus"
        toasterId="states"
        toasterProps={{ closeButton: true }}
        withAction
      />
    </div>
  ),
  parameters: { visualState: { focusVisible: '[data-sonner-toast][data-front="true"]' } },
}

/* Right-to-left: the host takes the region's direction, so icons and text read
   right to left and the close button sits at the start corner. */
export const RightToLeft: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      <ToastStage
        label="rtl / ar"
        providerProps={{ dir: 'rtl', lang: 'ar' }}
        toasterId="rtl"
        toasterProps={{
          closeButton: true,
          containerAriaLabel: 'الإشعارات',
          position: 'bottom-left',
          toastOptions: { closeButtonAriaLabel: 'إغلاق الإشعار' },
        }}
      />
    </div>
  ),
}

/* At phone width on touch: bottom-centre, clear of the home indicator's
   safe-area inset. */
export const Phone: Story = {
  render: () => (
    <ToastStage
      height={620}
      label="phone"
      providerProps={{
        designLanguage: 'ios',
        input: 'touch',
        style: { '--a63-safe-area-bottom': '34px' } as CSSProperties,
      }}
      toasterId="phone"
      toasterProps={{ closeButton: true, position: 'bottom-center' }}
    />
  ),
}

function ScopedDarkToastDemo() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    toast.success('Dark region saved', { id: 'scoped-dark-story' })
    return () => {
      toast.dismiss('scoped-dark-story')
    }
  }, [])

  return (
    <UIProvider mode="light">
      <div
        style={{
          background: 'var(--a63-surface-panel)',
          color: 'var(--a63-text-primary)',
          minHeight: 240,
          padding: 24,
          width: 480,
        }}
      >
        Light app
        <UIProvider mode="dark">
          <div
            data-testid="dark-toast-region"
            ref={setPortalContainer}
            style={{
              background: 'var(--a63-surface-page)',
              color: 'var(--a63-text-primary)',
              marginBlockStart: 16,
              minHeight: 160,
              padding: 24,
            }}
          >
            Dark region
            <PortalContainerProvider container={portalContainer}>
              <Toaster position="bottom-center" />
            </PortalContainerProvider>
          </div>
        </UIProvider>
      </div>
    </UIProvider>
  )
}

/** A nested dark region owns the toast portal and its font/theme variables. */
export const ScopedDarkRegion: Story = {
  render: () => <ScopedDarkToastDemo />,
  play: async ({ canvasElement }) => {
    const region = canvasElement.querySelector<HTMLElement>('[data-testid="dark-toast-region"]')
    if (!region) throw new Error('Expected the dark toast region')
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const toaster = region.querySelector<HTMLElement>('[data-sonner-toaster]')
      if (toaster) {
        if (toaster.style.fontFamily !== 'var(--a63-font-app, var(--font-family-sans))') {
          throw new Error(`Expected the application font, got ${toaster.style.fontFamily}`)
        }
        return
      }
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    throw new Error('Expected the toast inside the dark region')
  },
}

function RaiseOnMount() {
  useEffect(() => {
    toast.loading('Scheduling message…', { id: 'inverse-story' })
    return () => {
      toast.dismiss('inverse-story')
    }
  }, [])
  return null
}

async function findInverseToast(): Promise<HTMLElement> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const element = document.querySelector<HTMLElement>('.a63-Toast--inverse[data-mounted="true"]')
    if (element) return element
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  throw new Error('Expected the inverse toast')
}

/*
 * variant="inverse": a compact pill in the inverse colours with the status icon
 * after the message, the macOS and iOS look for a short status. It is dark on a
 * light app and light on a dark one.
 */
export const Inverse: Story = {
  args: { position: 'bottom-center', variant: 'inverse' },
  render: args => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.loading('Scheduling message…')} variant="outline">
        Loading
      </Button>
      <Button onClick={() => toast.success('Message sent')} variant="outline">
        Success
      </Button>
      <RaiseOnMount />
      <Toaster {...args} />
    </div>
  ),
  play: async () => {
    const pill = await findInverseToast()
    const style = getComputedStyle(pill)
    if (style.borderTopLeftRadius !== '9999px') {
      throw new Error(`Expected a pill, got ${style.borderTopLeftRadius}`)
    }
    const icon = pill.querySelector<HTMLElement>('[data-icon]')
    const title = pill.querySelector<HTMLElement>('[data-title]')
    if (!icon || !title) throw new Error('Expected an icon and a message')
    if (icon.getBoundingClientRect().left < title.getBoundingClientRect().right) {
      throw new Error('Expected the icon after the message')
    }
    if (pill.getBoundingClientRect().width >= 356) {
      throw new Error('Expected the pill to hug its message')
    }
  },
}
