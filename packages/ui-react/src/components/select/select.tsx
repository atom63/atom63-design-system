'use client'

import { type SelectSize, selectContract } from '@atom63/ui-foundation'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { usePortalContainer } from '../portal-container'

export const Select = SelectPrimitive.Root

/**
 * Visual shell for `SelectTrigger`. Reuse for popovers or other controls that
 * should match select triggers (e.g. filter bars). Mirrors prod's
 * `selectTriggerDefaultClassName` export, expressed as the DS recipe class.
 */
export const selectTriggerDefaultClassName = 'a63-Select-trigger'

export type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  size?: SelectSize
  /** Draws the danger edge and sets `aria-invalid`, as `Input`'s `invalid` does.
   *  `aria-invalid` on its own draws the same state. */
  invalid?: boolean
}

/* Base UI Select 1.6 opens only on Enter, Space and the arrow keys. The APG
 * select-only combobox also opens on Home and End, at the first or last option:
 * open with Down Arrow, then send Home or End to the option that takes focus. */
function openAtEdge(trigger: HTMLElement, edge: 'Home' | 'End'): void {
  const send = (target: Element, key: string) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }))
  send(trigger, 'ArrowDown')
  const doc = trigger.ownerDocument
  let frames = 0
  const moveToEdge = () => {
    const option = doc.activeElement?.closest('[role="option"]')
    if (option) {
      send(option, edge)
    } else if (++frames < 30) {
      requestAnimationFrame(moveToEdge)
    }
  }
  requestAnimationFrame(moveToEdge)
}

export function SelectTrigger({
  'aria-invalid': ariaInvalid,
  children,
  className,
  invalid = false,
  onKeyDown,
  size = selectContract.defaultSize,
  ...props
}: SelectTriggerProps): React.ReactElement {
  const isInvalid = invalid || ariaInvalid === true || ariaInvalid === 'true'
  return (
    <SelectPrimitive.Trigger
      aria-invalid={isInvalid ? true : ariaInvalid}
      className={cn(selectTriggerDefaultClassName, className)}
      data-size={size}
      data-slot="select-trigger"
      {...(isInvalid ? { 'data-invalid': '' } : null)}
      onKeyDown={event => {
        onKeyDown?.(event)
        const trigger = event.currentTarget
        const closed = trigger.getAttribute('aria-expanded') !== 'true'
        if (event.defaultPrevented || !closed || (event.key !== 'Home' && event.key !== 'End')) {
          return
        }
        event.preventDefault()
        openAtEdge(trigger, event.key)
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
  onKeyDown,
  portalContainer,
  sideOffset = 4,
  alignItemWithTrigger = true,
  ...props
}: SelectPopupProps): React.ReactElement {
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
            // APG select-only combobox: Tab and Alt + Up Arrow select the focused
            // option; Base UI 1.6 closes on Tab and treats Alt + Up as Up.
            const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]')
            if (event.defaultPrevented || !option || option.hasAttribute('data-disabled')) {
              return
            }
            if (event.key === 'Tab') {
              option.click()
            } else if (event.key === 'ArrowUp' && event.altKey) {
              event.preventDefault()
              event.preventBaseUIHandler()
              option.click()
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
  // A listbox may own only options and groups, so a separator role inside the
  // popup fails axe (aria-required-children). The rule is drawn for sight only.
  return (
    <SelectPrimitive.Separator
      aria-orientation={undefined}
      className={cn('a63-Menu-separator', 'a63-Select-separator', className)}
      data-slot="select-separator"
      role="none"
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
