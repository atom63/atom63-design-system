'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { Toaster as Sonner, type ToasterProps as SonnerToasterProps } from 'sonner'

import { type ToasterVariant, toasterContract } from '@atom63/ui-foundation'

import { cn } from '../../lib/cn'
import { usePortalContainer } from '../portal-container'

export interface ToasterProps extends SonnerToasterProps {
  /**
   * `default` draws a card on the overlay surface. `inverse` draws a compact
   * pill in the inverse colours (dark on a light app, light on a dark one) with
   * the icon after the message, for a short status such as "Scheduling message…".
   */
  variant?: ToasterVariant
  /**
   * The status word read before each toned toast's message, so a screen reader
   * hears the tone the icon shows. It is visually hidden. Defaults to English
   * ("Error:", "Information:", "Loading:", "Success:", "Warning:"); pass the
   * words for the page's language.
   */
  statusLabels?: Partial<Record<ToastStatus, string>>
}

export type ToastStatus = 'error' | 'info' | 'loading' | 'success' | 'warning'

const defaultStatusLabels: Record<ToastStatus, string> = {
  error: 'Error:',
  info: 'Information:',
  loading: 'Loading:',
  success: 'Success:',
  warning: 'Warning:',
}

/* Each toned toast shows an icon (coloured by tone in toaster.css) and carries a
   visually hidden status word, so the tone does not rest on the icon's shape or
   colour alone. */
function statusIcon(icon: React.ReactElement, label: string) {
  return (
    <>
      {icon}
      <span className="a63-Toast-status">{label}</span>
    </>
  )
}

/* Sonner reads its colours and corner from these variables on the host. They
   read --a63-* tokens only: the shadcn compat aliases are not part of
   `@atom63/ui-react/styles.css`, so a toast drawn from them has no fill. */
const variantStyles: Record<ToasterVariant, React.CSSProperties> = {
  default: {
    '--border-radius': 'var(--a63-overlay-radius, var(--radius-lg))',
    '--normal-bg': 'var(--a63-surface-overlay)',
    '--normal-border': 'var(--a63-border-subtle)',
    '--normal-text': 'var(--a63-text-primary)',
  } as React.CSSProperties,
  inverse: {
    '--border-radius': 'var(--radius-pill)',
    '--normal-bg': 'var(--a63-action-neutral)',
    '--normal-border': 'transparent',
    '--normal-text': 'var(--a63-action-neutral-foreground)',
  } as React.CSSProperties,
}

/* Sonner's own sheet is unlayered and paints the toast's background, border and
   shadow, so the overlay contract (the theme's border, gloss, texture, backdrop
   and elevation, as Dialog, Popover and Menu read it) goes on each default
   toast's inline style. The focus ring is an outline (toaster.css). */
const overlayToastStyle: React.CSSProperties = {
  backdropFilter: 'var(--a63-overlay-backdrop)',
  backgroundBlendMode: 'normal, var(--a63-overlay-texture-blend)',
  backgroundImage: 'var(--a63-overlay-gloss), var(--a63-overlay-texture-image)',
  borderStyle: 'var(--a63-overlay-border-style)',
  borderWidth: 'var(--a63-overlay-border-width)',
  boxShadow: 'var(--a63-overlay-inner-shadow, none), var(--a63-overlay-shadow)',
}

/* The compact geometry of the inverse pill goes on each toast's inline style for
   the same reason; the rest of the pill lives in toaster.css. */
const inverseToastStyle: React.CSSProperties = {
  fontSize: 'var(--a63-type-subhead-font-size)',
  gap: 'var(--a63-space-2)',
  paddingBlock: 'var(--a63-space-2)',
  paddingInline: 'var(--a63-space-4)',
}

/* Sonner renders each toast, its icon and its title itself and takes no data
   attributes for them, so the host stamps the contract slots on them. */
const partSlots = [
  ['[data-sonner-toast]', { 'data-slot': toasterContract.slots[1] }],
  ['[data-sonner-toast] [data-icon]', { 'data-slot': toasterContract.slots[2] }],
  ['[data-sonner-toast] [data-title]', { 'data-slot': toasterContract.slots[3] }],
] as const

function stampPartSlots(root: Element) {
  for (const [selector, attributes] of partSlots) {
    for (const part of root.querySelectorAll(selector)) {
      part.setAttribute('data-slot', attributes['data-slot'])
    }
  }
}

/* Sonner reads the direction from <html> only. A host inside a UIProvider
   dir="rtl" region takes that region's direction instead. */
function directionOf(container: HTMLElement | ShadowRoot): ToasterProps['dir'] {
  const element = 'host' in container ? container.host : container
  const dir = element.closest('[dir]')?.getAttribute('dir')
  return dir === 'rtl' || dir === 'ltr' ? dir : undefined
}

/* Sonner's default 24px (16px below 600px) offsets, plus the safe-area insets,
   so a toast clears a notch or a home indicator. */
const safeAreaOffset = (space: string) => ({
  bottom: `calc(${space} + var(--a63-safe-area-bottom, 0px))`,
  left: `calc(${space} + var(--a63-safe-area-left, 0px))`,
  right: `calc(${space} + var(--a63-safe-area-right, 0px))`,
  top: `calc(${space} + var(--a63-safe-area-top, 0px))`,
})
const subscribeToNothing = () => () => {}

const defaultOffset = safeAreaOffset('var(--a63-space-6)')
const defaultMobileOffset = safeAreaOffset('var(--a63-space-4)')

/*
 * Toaster — the sonner host that renders toasts raised inside this package
 * (CopyButton being the main one). It ships here so consuming apps do not need
 * their own sonner dependency just to make package components audible.
 *
 * Colors and font resolve from the theme contract rather than sonner's built-in
 * palette and system stack. PortalContainerProvider keeps a host inside a
 * nested theme region; without one, the host keeps its document-body fallback.
 * Raise toasts with `toast()` and its tones `toast.info`, `toast.success`,
 * `toast.warning`, `toast.error` and `toast.loading`. The English labels are
 * props: `containerAriaLabel` names the region ("Notifications") and
 * `toastOptions.closeButtonAriaLabel` the close button ("Close toast") and
 * `statusLabels` the hidden status word each toned toast starts with ("Error:").
 */
export function Toaster({
  className,
  dir,
  mobileOffset = defaultMobileOffset,
  offset = defaultOffset,
  statusLabels,
  style,
  toastOptions,
  variant = toasterContract.defaultVariant,
  ...props
}: ToasterProps): React.ReactElement | null {
  const inverse = variant === 'inverse'
  const labels = { ...defaultStatusLabels, ...statusLabels }
  const portalContainer = usePortalContainer()
  const [section, setSection] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!section) return
    stampPartSlots(section)
    const observer = new MutationObserver(() => stampPartSlots(section))
    observer.observe(section, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [section])

  // The host portals on the client only, so the server and the hydrating client
  // both render nothing and the portal mounts after hydration.
  const mounted = React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  )
  const container = mounted ? (portalContainer ?? document.body) : null
  const toaster = (
    <Sonner
      className={cn('a63-Toaster toaster group', className)}
      data-slot={toasterContract.slots[0]}
      dir={dir ?? (container ? directionOf(container) : undefined)}
      mobileOffset={mobileOffset}
      offset={offset}
      ref={setSection}
      icons={{
        error: statusIcon(<OctagonXIcon aria-hidden className="size-4" />, labels.error),
        info: statusIcon(<InfoIcon aria-hidden className="size-4" />, labels.info),
        loading: statusIcon(
          <Loader2Icon aria-hidden className="size-4 animate-spin" />,
          labels.loading
        ),
        success: statusIcon(<CircleCheckIcon aria-hidden className="size-4" />, labels.success),
        warning: statusIcon(<TriangleAlertIcon aria-hidden className="size-4" />, labels.warning),
      }}
      style={{
        ...variantStyles[variant],
        fontFamily: 'var(--a63-font-app, var(--font-family-sans))',
        zIndex: 'var(--z-layer-toast)',
        ...style,
      }}
      {...props}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          icon: cn(inverse ? undefined : 'mt-0.5', toastOptions?.classNames?.icon),
          toast: cn(
            inverse ? 'a63-Toast a63-Toast--inverse' : '!items-start',
            toastOptions?.classNames?.toast
          ),
        },
        style: { ...(inverse ? inverseToastStyle : overlayToastStyle), ...toastOptions?.style },
      }}
    />
  )

  return container ? createPortal(toaster, container) : null
}
