'use client'

import { type SelectSize, selectContract } from '@atom63/ui-foundation'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/cn'
import { usePortalContainer } from '../portal-container'

/*
 * Set while Tab selects the highlighted option: the option's click commits the
 * value and would close the listbox, and the root cancels that close, so Base
 * UI's own Tab handling then moves focus on and closes the listbox as usual.
 */
const SelectKeepOpenContext = React.createContext<React.RefObject<boolean> | null>(null)

export function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>
): React.ReactElement {
  const { onOpenChange, ...rootProps } = props
  const keepOpenRef = React.useRef(false)
  return (
    <SelectKeepOpenContext.Provider value={keepOpenRef}>
      <SelectPrimitive.Root
        {...rootProps}
        onOpenChange={(open, eventDetails) => {
          if (!open && keepOpenRef.current && eventDetails.reason === 'item-press') {
            eventDetails.cancel()
            return
          }
          onOpenChange?.(open, eventDetails)
        }}
      />
    </SelectKeepOpenContext.Provider>
  )
}

/**
 * Visual shell for `SelectTrigger`. Reuse for popovers or other controls that
 * should match select triggers (e.g. filter bars). Mirrors prod's
 * `selectTriggerDefaultClassName` export, expressed as the DS recipe class.
 */
export const selectTriggerDefaultClassName = 'a63-Select-trigger'

/*
 * Keyboard behavior from the APG select-only combobox that Base UI Select
 * lacks. Each key drives Base UI through its own handling (its keyboard
 * navigation, or a click on an option, its activation path), so selection,
 * `onValueChange`, `onOpenChange` and controlled props behave as they do for
 * Base UI's own keys:
 * - Home and End on the closed combobox open the listbox on the first or last
 *   option.
 * - Alt + Up Arrow selects the highlighted option and closes the listbox.
 * - Tab selects the highlighted option; Base UI's Tab handling then closes
 *   the listbox and moves focus on, as without the selection.
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
 */
type SelectKeyboardEvent = Parameters<NonNullable<SelectPrimitive.Trigger.Props['onKeyDown']>>[0]

/** How many frames to wait for the listbox to open and focus an option. */
const OPEN_FRAMES = 30

function pressKey(target: Element, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }))
}

/**
 * Opens the listbox with Base UI's Down Arrow handling, then presses Home or
 * End on the option it focuses, so Base UI's list navigation moves to the
 * first or last enabled option.
 */
function openAtEdge(trigger: HTMLElement, key: 'End' | 'Home') {
  pressKey(trigger, 'ArrowDown')
  let frames = 0
  const moveToEdge = () => {
    const active = trigger.ownerDocument.activeElement
    const listId = trigger.getAttribute('aria-controls')
    const list = listId ? trigger.ownerDocument.getElementById(listId) : null
    if (active && list?.contains(active) && active.getAttribute('role') === 'option') {
      pressKey(active, key)
    } else if (++frames < OPEN_FRAMES) {
      requestAnimationFrame(moveToEdge)
    }
  }
  requestAnimationFrame(moveToEdge)
}

/** Clicks the highlighted option of a single-select listbox, Base UI's activation path. */
function selectHighlighted(popup: HTMLElement): boolean {
  const list = popup.querySelector('[role="listbox"]') ?? popup
  if (list.getAttribute('aria-multiselectable') === 'true') return false
  const option = list.querySelector<HTMLElement>('[role="option"][data-highlighted]')
  if (!option || option.hasAttribute('data-disabled')) return false
  option.click()
  return true
}

function hasModifier(event: SelectKeyboardEvent) {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
}

export type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  size?: SelectSize
}

export function SelectTrigger({
  children,
  className,
  onKeyDown,
  size = selectContract.defaultSize,
  ...props
}: SelectTriggerProps): React.ReactElement {
  return (
    <SelectPrimitive.Trigger
      className={cn(selectTriggerDefaultClassName, className)}
      data-size={size}
      data-slot="select-trigger"
      onKeyDown={event => {
        onKeyDown?.(event)
        const trigger = event.currentTarget
        if (
          (event.key === 'Home' || event.key === 'End') &&
          !hasModifier(event) &&
          !event.defaultPrevented &&
          !event.baseUIHandlerPrevented &&
          trigger.getAttribute('aria-expanded') === 'false' &&
          trigger.getAttribute('aria-readonly') !== 'true' &&
          !trigger.hasAttribute('data-disabled')
        ) {
          event.preventDefault()
          event.preventBaseUIHandler()
          openAtEdge(trigger, event.key)
        }
      }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="a63-Select-icon" data-slot="select-icon">
        <ChevronsUpDown aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectValue({
  className,
  ...props
}: SelectPrimitive.Value.Props): React.ReactElement {
  return (
    <SelectPrimitive.Value
      className={cn('a63-Select-value', className)}
      data-slot="select-value"
      {...props}
    />
  )
}

export interface SelectPopupProps extends SelectPrimitive.Popup.Props {
  listClassName?: string
  portalContainer?: SelectPrimitive.Portal.Props['container']
  sideOffset?: SelectPrimitive.Positioner.Props['sideOffset']
  alignItemWithTrigger?: SelectPrimitive.Positioner.Props['alignItemWithTrigger']
}

export function SelectPopup({
  children,
  className,
  listClassName,
  portalContainer,
  sideOffset = 4,
  alignItemWithTrigger = true,
  onKeyDown,
  ...props
}: SelectPopupProps): React.ReactElement {
  const keepOpenRef = React.useContext(SelectKeepOpenContext)
  const contextPortalContainer = usePortalContainer()
  const container = portalContainer ?? contextPortalContainer

  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner
        alignItemWithTrigger={alignItemWithTrigger}
        className="a63-Select-positioner"
        data-slot="select-positioner"
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className={cn('a63-Select-popup', className)}
          data-slot="select-popup"
          onKeyDown={event => {
            onKeyDown?.(event)
            if (event.defaultPrevented || event.baseUIHandlerPrevented) return
            const altUp =
              event.key === 'ArrowUp' &&
              event.altKey &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey
            if (altUp && selectHighlighted(event.currentTarget)) {
              event.preventDefault()
              event.preventBaseUIHandler()
            } else if (
              event.key === 'Tab' &&
              keepOpenRef &&
              !event.altKey &&
              !event.ctrlKey &&
              !event.metaKey
            ) {
              // Select without closing, and leave the default action to Base UI.
              keepOpenRef.current = true
              try {
                selectHighlighted(event.currentTarget)
              } finally {
                keepOpenRef.current = false
              }
            }
          }}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            className="a63-Select-scroll-arrow"
            data-slot="select-scroll-up-arrow"
          >
            <ChevronUp aria-hidden="true" />
          </SelectPrimitive.ScrollUpArrow>
          {/* Menu chrome on the surface — scroll arrows sit outside the plate. */}
          <div className="a63-Select-surface a63-Menu-popup" data-slot="select-surface">
            <SelectPrimitive.List
              className={cn('a63-Select-list', listClassName)}
              data-slot="select-list"
            >
              {children}
            </SelectPrimitive.List>
          </div>
          <SelectPrimitive.ScrollDownArrow
            className="a63-Select-scroll-arrow"
            data-slot="select-scroll-down-arrow"
          >
            <ChevronDown aria-hidden="true" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({
  children,
  className,
  ...props
}: SelectPrimitive.Item.Props): React.ReactElement {
  return (
    <SelectPrimitive.Item
      className={cn('a63-Menu-item', 'a63-Select-item', className)}
      data-slot="select-item"
      {...props}
    >
      <SelectPrimitive.ItemIndicator
        className="a63-Select-item-indicator"
        data-slot="select-item-indicator"
      >
        <Check aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="a63-Select-item-text" data-slot="select-item-text">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props): React.ReactElement {
  return (
    <SelectPrimitive.Separator
      className={cn('a63-Menu-separator', 'a63-Select-separator', className)}
      data-slot="select-separator"
      {...props}
    />
  )
}

export function SelectGroup(props: SelectPrimitive.Group.Props): React.ReactElement {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

export function SelectGroupLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props): React.ReactElement {
  return (
    <SelectPrimitive.GroupLabel
      className={cn('a63-Menu-label', 'a63-Select-group-label', className)}
      data-slot="select-group-label"
      {...props}
    />
  )
}

/** Alias matching prod's `SelectContent` import name. */
export const SelectContent = SelectPopup
