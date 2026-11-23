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

async function findVisible(root: HTMLElement, selector: string): Promise<HTMLElement> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const element = [...root.querySelectorAll<HTMLElement>(selector)].find(match =>
      match.checkVisibility()
    )
    if (element) return element
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  throw new Error(`Expected a visible ${selector}`)
}

/* The focus-ring colour as the system resolves it at this element. */
function focusRingColor(element: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.color = 'var(--a63-control-focus-ring-color, var(--a63-focus-ring))'
  element.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/*
 * Focuses each target and reads its computed outline: the system's focus ring
 * (a solid outline in the focus-ring colour), not Sonner's `outline: none`.
 */
async function expectFocusRings(root: HTMLElement, selectors: string[]) {
  for (const selector of selectors) {
    const target = await findVisible(root, selector)
    target.focus()
    if (!target.matches(':focus-visible')) throw new Error(`Expected ${selector} :focus-visible`)
    const style = getComputedStyle(target)
    if (style.outlineStyle !== 'solid' || Number.parseFloat(style.outlineWidth) < 1) {
      throw new Error(
        `Expected an outline on ${selector}, got ${style.outlineStyle} ${style.outlineWidth}`
      )
    }
    const expected = focusRingColor(target)
    if (style.outlineColor !== expected) {
      throw new Error(`Expected ${selector} outline ${expected}, got ${style.outlineColor}`)
    }
    target.blur()
  }
}

const FRONT_TOAST = '[data-sonner-toast][data-front="true"]'
const ACTION_BUTTON = '[data-sonner-toast] [data-button]'
const CLOSE_BUTTON = '[data-sonner-toast] [data-close-button]'

function StatesStage({ label }: { label: string }) {
  return (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      <ToastStage
        height={560}
        label={label}
        toasterId="states"
        toasterProps={{ closeButton: true }}
        withAction
      />
    </div>
  )
}

/*
 * The interactive states: an error toast with a description and an action, every
 * toast with its close button, and keyboard focus on the front toast. The play
 * function checks the focus ring on the toast, the action and the close button.
 */
export const States: Story = {
  render: () => <StatesStage label="action, close button, keyboard focus" />,
  parameters: { visualState: { focusVisible: FRONT_TOAST } },
  play: async ({ canvasElement }) => {
    await expectFocusRings(canvasElement, [FRONT_TOAST, ACTION_BUTTON, CLOSE_BUTTON])
  },
}

/* Keyboard focus on the error toast's action. */
export const FocusVisibleAction: Story = {
  render: () => <StatesStage label="keyboard focus on the action" />,
  parameters: { visualState: { focusVisible: ACTION_BUTTON } },
}

/* Keyboard focus on a close button (the loading toast at the front has none). */
export const FocusVisibleClose: Story = {
  render: () => <StatesStage label="keyboard focus on the close button" />,
  parameters: { visualState: { focusVisible: CLOSE_BUTTON } },
}

/* Forced colors (Windows High Contrast), with keyboard focus on the front toast:
   the outline ring stays where a box-shadow ring would be dropped. */
export const ForcedColors: Story = {
  render: () => <StatesStage label="forced colors, keyboard focus" />,
  parameters: { visualState: { focusVisible: FRONT_TOAST } },
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
   safe-area inset. The play function checks the 44px hit area of the action and
   the close button. */
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
      withAction
    />
  ),
  play: async ({ canvasElement }) => {
    await expectTouchTargets(canvasElement, [ACTION_BUTTON, CLOSE_BUTTON])
  },
}

/* On a coarse pointer the hit-area pseudo of each target is at least 44px. */
async function expectTouchTargets(root: HTMLElement, selectors: string[]) {
  for (const selector of selectors) {
    const target = await findVisible(root, `[data-a63-input="touch"] ${selector}`)
    const hitArea = getComputedStyle(target, '::before')
    const width = Number.parseFloat(hitArea.width)
    const height = Number.parseFloat(hitArea.height)
    if (!(width >= 44 && height >= 44)) {
      throw new Error(`Expected a 44px hit area on ${selector}, got ${width}x${height}`)
    }
  }
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
