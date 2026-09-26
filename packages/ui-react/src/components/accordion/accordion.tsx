'use client'

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import * as React from 'react'

import { cn } from '../../lib/cn'

/*
 * Accordion — a stack of collapsible sections (Base UI Accordion). Faithful to
 * prod @atom63/ui: same parts (Root/Item/Trigger/Content) + the shadcn-style
 * `type`/`collapsible`/`value` shim on the root and the `icon`
 * ('chevron' | 'plus-minus') switch on the trigger. Item borders, the trigger
 * highlight (--a63-surface-control-hover), focus ring and radii resolve from
 * semantics/foundation at the use-site, so the 4 themes restyle it for free.
 * Icons are inline SVGs (no icon fonts). No new --a63-* tokens.
 */

type AccordionProps = Omit<
  AccordionPrimitive.Root.Props<string>,
  'defaultValue' | 'multiple' | 'onValueChange' | 'value'
> & {
  collapsible?: boolean
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  type?: 'multiple' | 'single'
  value?: string | string[]
}

/*
 * The APG gives every header button aria-controls referring to its panel.
 * Base UI sets it only while the panel is open, and unmounts a closed panel,
 * so a collapsed header has none. The accordion keeps closed panels mounted
 * (hidden) by default, and each header points at its panel whenever the panel
 * stays in the DOM. With `keepMounted={false}` (on the root or a panel) the
 * header falls back to Base UI's behavior, so it never refers to a missing
 * element.
 */
interface AccordionPanelRef {
  id: string
  persistent: boolean
}

// Outside `Accordion` (a Base UI root), Base UI's defaults apply.
const AccordionRootContext = React.createContext({ hiddenUntilFound: false, keepMounted: false })
const AccordionItemContext = React.createContext<{
  panel: AccordionPanelRef | null
  panelId: string
  setPanel: (panel: AccordionPanelRef | null) => void
} | null>(null)

const toValueArray = (value: string | string[] | undefined) => {
  if (!value) {
    return undefined
  }
  return Array.isArray(value) ? value : [value]
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

function PlusIcon() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="M3 8h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function Accordion({
  collapsible: _collapsible,
  defaultValue,
  onValueChange,
  hiddenUntilFound = false,
  keepMounted = true,
  type = 'single',
  value,
  ...props
}: AccordionProps): React.ReactElement {
  const multiple = type === 'multiple'
  const rootContext = React.useMemo(
    () => ({ hiddenUntilFound, keepMounted }),
    [hiddenUntilFound, keepMounted]
  )

  return (
    <AccordionRootContext.Provider value={rootContext}>
      <AccordionPrimitive.Root
        className={cn('a63-Accordion')}
        data-slot="accordion"
        defaultValue={toValueArray(defaultValue)}
        hiddenUntilFound={hiddenUntilFound}
        keepMounted={keepMounted}
        multiple={multiple}
        onValueChange={
          onValueChange
            ? nextValue => onValueChange(multiple ? nextValue : (nextValue.at(0) ?? ''))
            : undefined
        }
        value={toValueArray(value)}
        {...props}
      />
    </AccordionRootContext.Provider>
  )
}

export function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props): React.ReactElement {
  const panelId = `${React.useId()}-panel`
  const [panel, setPanel] = React.useState<AccordionPanelRef | null>(null)
  const itemContext = React.useMemo(() => ({ panel, panelId, setPanel }), [panel, panelId])
  return (
    <AccordionItemContext.Provider value={itemContext}>
      <AccordionPrimitive.Item
        className={cn('a63-Accordion-item', className)}
        data-slot="accordion-item"
        {...props}
      />
    </AccordionItemContext.Provider>
  )
}

export interface AccordionTriggerProps extends AccordionPrimitive.Trigger.Props {
  icon?: 'chevron' | 'plus-minus'
}

export function AccordionTrigger({
  children,
  className,
  icon = 'chevron',
  ...props
}: AccordionTriggerProps): React.ReactElement {
  const root = React.useContext(AccordionRootContext)
  const item = React.useContext(AccordionItemContext)
  // Before the panel registers (the first render, and server rendering),
  // assume it follows the root's settings.
  const panel =
    item &&
    (item.panel ?? { id: item.panelId, persistent: root.hiddenUntilFound || root.keepMounted })
  return (
    <AccordionPrimitive.Header className="a63-Accordion-header">
      <AccordionPrimitive.Trigger
        {...(panel?.persistent ? { 'aria-controls': panel.id } : {})}
        className={cn('a63-Accordion-trigger', className)}
        data-icon={icon}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <span className="a63-Accordion-indicator" data-slot="accordion-indicator">
          {icon === 'plus-minus' ? (
            <>
              <span className="a63-Accordion-indicator-plus">
                <PlusIcon />
              </span>
              <span className="a63-Accordion-indicator-minus">
                <MinusIcon />
              </span>
            </>
          ) : (
            <span className="a63-Accordion-indicator-chevron">
              <ChevronDownIcon />
            </span>
          )}
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({
  children,
  className,
  hiddenUntilFound: hiddenUntilFoundProp,
  id: idProp,
  keepMounted: keepMountedProp,
  ...props
}: AccordionPrimitive.Panel.Props): React.ReactElement {
  const root = React.useContext(AccordionRootContext)
  const item = React.useContext(AccordionItemContext)
  const setPanel = item?.setPanel
  const id = idProp ?? item?.panelId
  const hiddenUntilFound = hiddenUntilFoundProp ?? root.hiddenUntilFound
  const persistent = hiddenUntilFound || (keepMountedProp ?? root.keepMounted)
  React.useLayoutEffect(() => {
    if (!setPanel || !id) return undefined
    setPanel({ id, persistent })
    return () => setPanel(null)
  }, [id, persistent, setPanel])

  return (
    <AccordionPrimitive.Panel
      className="a63-Accordion-panel"
      data-slot="accordion-content"
      hiddenUntilFound={hiddenUntilFoundProp}
      id={id}
      keepMounted={keepMountedProp}
      {...props}
    >
      <div
        className={cn('a63-Accordion-content-inner', className)}
        data-slot="accordion-content-inner"
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export type { AccordionProps }
