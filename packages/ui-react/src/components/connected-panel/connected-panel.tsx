'use client'

import { type ConnectedPanelAlign, connectedPanelContract } from '@atom63/ui-foundation'
import { AnimatePresence, type HTMLMotionProps, motion, useReducedMotion } from 'motion/react'
import * as React from 'react'
import { cn } from '../../lib/cn'
import { Button, type ButtonProps } from '../button'

/*
 * ConnectedPanel — an expand/collapse surface whose collapsed pill morphs
 * (width + corner radius) into an expanded panel, the trigger and content
 * reading as one continuous chrome. Faithful port of prod @atom63/ui
 * connected-panel.tsx: same parts (Root/Trigger/Content/Header/Title/
 * Description/Body/Footer), same props (align/open/defaultOpen/onOpenChange/
 * collapsedWidth/expandedWidth/contentWidth/duration/wrapperClassName + Trigger
 * icon/label/summary/showChevron). Like prod, the Trigger renders the DS Button
 * (variant="ghost") — so it inherits Button chrome + all ButtonProps as an
 * escape hatch — with the recipe .a63-ConnectedPanel-trigger flattening it into
 * the connected surface (prod's withMotion={false} is moot: the DS Button has no
 * motion). Prod's `align` Record maps become a
 * @atom63/ui-foundation contract keyed off data-align (badge/frame pattern) — no
 * cva. Surface/border/radius resolve to --a63-* semantics; the size + radius
 * morph animate via motion, matching prod.
 */

interface ConnectedPanelContextValue {
  align: ConnectedPanelAlign
  contentId: string
  contentWidth: number | string
  duration: number
  open: boolean
  reducedMotion: boolean
  setOpen: (open: boolean) => void
}

const ConnectedPanelContext = React.createContext<ConnectedPanelContextValue | null>(null)

function useConnectedPanelContext(component: string): ConnectedPanelContextValue {
  const context = React.useContext(ConnectedPanelContext)
  if (!context) {
    throw new Error(`${component} must be used within ConnectedPanel`)
  }
  return context
}

const DEFAULT_CONNECTED_PANEL_DURATION = 0.32
const PANEL_SIZE_EASE = [0.2, 0, 0, 1] as const
const PANEL_SIZE_EASE_CSS = 'cubic-bezier(0.2, 0, 0, 1)'
const PANEL_OPACITY_EASE = 'easeOut'
const LABEL_SPRING = { type: 'spring', stiffness: 500, damping: 34 } as const

type ConnectedPanelStyle = NonNullable<HTMLMotionProps<'div'>['style']> & {
  '--connected-panel-collapsed-radius'?: string
  '--connected-panel-expanded-radius'?: string
  '--connected-panel-transition-duration'?: string
  '--connected-panel-transition-ease'?: string
}

function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

function getMotionTextKey(...values: React.ReactNode[]): string {
  return values
    .map((value, index) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
        return String(value)
      }
      if (React.isValidElement(value) && value.key !== null) {
        return String(value.key)
      }
      return `${index}:${typeof value}`
    })
    .join('|')
}

export type ConnectedPanelVariant = 'button-group' | 'default'

export interface ConnectedPanelProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  align?: ConnectedPanelAlign
  children: React.ReactNode
  collapsedWidth?: number | string
  contentWidth?: number | string
  defaultOpen?: boolean
  duration?: number
  expandedWidth?: number | string
  onOpenChange?: (open: boolean) => void
  open?: boolean
  variant?: ConnectedPanelVariant
  wrapperClassName?: string
}

export function ConnectedPanel({
  align = connectedPanelContract.defaultAlign,
  children,
  className,
  collapsedWidth = 192,
  contentWidth,
  defaultOpen = false,
  duration = DEFAULT_CONNECTED_PANEL_DURATION,
  expandedWidth = 320,
  onOpenChange,
  open: controlledOpen,
  style,
  transition,
  variant = 'default',
  wrapperClassName,
  ...props
}: ConnectedPanelProps): React.ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const contentId = React.useId()
  const reducedMotion = Boolean(useReducedMotion())
  const open = controlledOpen ?? uncontrolledOpen
  const panelStyle: ConnectedPanelStyle = {
    '--connected-panel-collapsed-radius': 'var(--radius-lg)',
    '--connected-panel-expanded-radius': 'var(--radius-md)',
    '--connected-panel-transition-duration': reducedMotion ? '0ms' : `${duration}s`,
    '--connected-panel-transition-ease': PANEL_SIZE_EASE_CSS,
    ...style,
  }

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [controlledOpen, onOpenChange]
  )

  const value = React.useMemo(
    () => ({
      align,
      contentId,
      contentWidth:
        contentWidth ??
        (variant === 'button-group'
          ? `calc(${toCssLength(expandedWidth)} - 2px - var(--a63-space-2))`
          : `calc(${toCssLength(expandedWidth)} - 2px)`),
      duration,
      open,
      reducedMotion,
      setOpen,
    }),
    [align, contentId, contentWidth, duration, expandedWidth, open, reducedMotion, setOpen, variant]
  )

  const surface = (
    <motion.div
      animate={{
        borderRadius: open
          ? 'var(--connected-panel-expanded-radius)'
          : 'var(--connected-panel-collapsed-radius)',
        padding: variant === 'button-group' ? (open ? 'var(--a63-space-1)' : '0px') : undefined,
        width: open ? expandedWidth : collapsedWidth,
      }}
      className={cn('a63-ConnectedPanel', className)}
      data-open={open ? '' : undefined}
      data-slot="connected-panel"
      data-state={open ? 'open' : 'closed'}
      data-variant={variant}
      initial={false}
      style={panelStyle}
      transition={
        reducedMotion ? { duration: 0 } : (transition ?? { duration, ease: PANEL_SIZE_EASE })
      }
      {...props}
    >
      {children}
    </motion.div>
  )

  return (
    <ConnectedPanelContext.Provider value={value}>
      {align === 'start' ? (
        surface
      ) : (
        <div
          className={cn('a63-ConnectedPanel-anchor', wrapperClassName)}
          data-align={align}
          data-slot="connected-panel-anchor"
          style={{ width: toCssLength(expandedWidth) }}
        >
          {surface}
        </div>
      )}
    </ConnectedPanelContext.Provider>
  )
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="M2 4h8m2 0h2M2 12h2m2 0h8M9 2v4m-3 4v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export interface ConnectedPanelTriggerProps extends Omit<ButtonProps, 'children'> {
  children?: React.ReactNode
  icon?: React.ReactNode
  label?: React.ReactNode
  showChevron?: boolean
  summary?: React.ReactNode
}

export function ConnectedPanelTrigger({
  children,
  className,
  icon,
  label,
  onClick,
  showChevron = true,
  summary,
  ...props
}: ConnectedPanelTriggerProps): React.ReactElement {
  const { contentId, open, reducedMotion, setOpen } =
    useConnectedPanelContext('ConnectedPanelTrigger')

  return (
    <Button
      aria-controls={contentId}
      aria-expanded={open}
      className={cn('a63-ConnectedPanel-trigger', className)}
      data-slot="connected-panel-trigger"
      onClick={event => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(!open)
        }
      }}
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? (
        <>
          <span
            aria-hidden
            className="a63-ConnectedPanel-trigger-icon"
            data-slot="connected-panel-trigger-icon"
          >
            {icon ?? <SlidersIcon />}
          </span>
          <span
            className="a63-ConnectedPanel-trigger-text"
            data-slot="connected-panel-trigger-text"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                animate={{ opacity: 1, y: 0 }}
                className="a63-ConnectedPanel-trigger-text-inner"
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                key={getMotionTextKey(label, summary)}
                transition={reducedMotion ? { duration: 0.12 } : LABEL_SPRING}
              >
                {label ? (
                  <span
                    className="a63-ConnectedPanel-trigger-label"
                    data-slot="connected-panel-trigger-label"
                  >
                    {label}
                  </span>
                ) : null}
                {label && summary ? (
                  <span className="a63-ConnectedPanel-trigger-sep">/</span>
                ) : null}
                {summary ? (
                  <span
                    className="a63-ConnectedPanel-trigger-summary"
                    data-slot="connected-panel-trigger-summary"
                  >
                    {summary}
                  </span>
                ) : null}
              </motion.span>
            </AnimatePresence>
          </span>
          {showChevron ? (
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              aria-hidden="true"
              className="a63-ConnectedPanel-trigger-chevron"
              data-slot="connected-panel-trigger-chevron"
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
            >
              <ChevronDownIcon />
            </motion.span>
          ) : null}
        </>
      )}
    </Button>
  )
}

export interface ConnectedPanelContentProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode
  forceMount?: boolean
}

export function ConnectedPanelContent({
  children,
  className,
  forceMount = false,
  ...props
}: ConnectedPanelContentProps): React.ReactElement {
  const { align, contentId, contentWidth, duration, open, reducedMotion } =
    useConnectedPanelContext('ConnectedPanelContent')
  const contentWidthValue = toCssLength(contentWidth)
  const contentWidthStyle =
    align === 'center'
      ? { marginInlineStart: `calc((100% - ${contentWidthValue}) / 2)`, width: contentWidthValue }
      : {
          marginInlineStart: align === 'end' ? `calc(100% - ${contentWidthValue})` : undefined,
          width: contentWidthValue,
        }

  return (
    <AnimatePresence initial={false}>
      {open || forceMount ? (
        <motion.div
          animate={{ height: open ? 'auto' : 0 }}
          aria-hidden={open ? undefined : true}
          className={cn('a63-ConnectedPanel-content', className)}
          data-slot="connected-panel-content"
          data-state={open ? 'open' : 'closed'}
          exit={{ height: 0 }}
          id={contentId}
          initial={{ height: 0 }}
          inert={open ? undefined : true}
          transition={reducedMotion ? { duration: 0 } : { duration, ease: PANEL_SIZE_EASE }}
          {...props}
        >
          <div
            className="a63-ConnectedPanel-content-clip"
            data-slot="connected-panel-content-clip"
            style={contentWidthStyle}
          >
            <motion.div
              animate={
                reducedMotion ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)', scale: 1 }
              }
              className="a63-ConnectedPanel-content-inner"
              data-align={align}
              data-slot="connected-panel-content-inner"
              exit={
                reducedMotion ? { opacity: 1 } : { opacity: 0, filter: 'blur(2px)', scale: 0.7 }
              }
              initial={
                reducedMotion ? { opacity: 1 } : { opacity: 0, filter: 'blur(2px)', scale: 0.7 }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      filter: { duration, ease: PANEL_OPACITY_EASE },
                      opacity: { duration, ease: PANEL_OPACITY_EASE },
                      scale: { duration, ease: PANEL_SIZE_EASE },
                    }
              }
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function ConnectedPanelHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-ConnectedPanel-header', className)}
      data-slot="connected-panel-header"
      {...props}
    />
  )
}

export function ConnectedPanelTitle({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-ConnectedPanel-title', className)}
      data-slot="connected-panel-title"
      {...props}
    />
  )
}

export function ConnectedPanelDescription({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-ConnectedPanel-description', className)}
      data-slot="connected-panel-description"
      {...props}
    />
  )
}

export function ConnectedPanelBody({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-ConnectedPanel-body', className)}
      data-slot="connected-panel-body"
      {...props}
    />
  )
}

export function ConnectedPanelFooter({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-ConnectedPanel-footer', className)}
      data-slot="connected-panel-footer"
      {...props}
    />
  )
}
