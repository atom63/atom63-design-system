'use client'

import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { ScrollArea } from '../scroll-area/scroll-area'

/*
 * Autocomplete — a text input with a filtered, portaled suggestion list (Base UI
 * Autocomplete). Faithful port of prod @atom63/ui autocomplete.tsx: every part is
 * kept with the same name + props — Root (Autocomplete) / Input (InputGroup +
 * Input + optional Trigger/Clear addons) / Popup / List / Item / Group /
 * GroupLabel / Empty / Separator / Row / Value / Status / Collection / Trigger /
 * Clear — plus the useAutocompleteFilter hook and the AutocompletePrimitive
 * re-export.
 *
 * Chrome is restyled from prod's Tailwind to a63-Autocomplete-* classes reading
 * a63 tokens: the input reuses the field contract (--a63-field-shadow), the popup
 * is the OVERLAY archetype (--a63-surface-overlay + --a63-overlay-shadow, stacking
 * --z-layer-menu). Prod's icon-font glyphs (chevron/close) are inline SVGs. No new
 * --a63-* tokens.
 */

export const Autocomplete: typeof AutocompletePrimitive.Root = AutocompletePrimitive.Root

function ChevronsUpDownIcon() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="M5 6.5 8 3.5 11 6.5M5 9.5l3 3 3-3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="m4 4 8 8M12 4l-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export interface AutocompleteInputProps extends Omit<AutocompletePrimitive.Input.Props, 'size'> {
  showTrigger?: boolean
  showClear?: boolean
  startAddon?: React.ReactNode
  size?: 'sm' | 'default' | 'lg' | number
  ref?: React.Ref<HTMLInputElement>
  triggerProps?: AutocompletePrimitive.Trigger.Props
  clearProps?: AutocompletePrimitive.Clear.Props
}

export function AutocompleteInput({
  className,
  clearProps,
  showClear = false,
  showTrigger = false,
  size,
  startAddon,
  triggerProps,
  ...props
}: AutocompleteInputProps): React.ReactElement {
  const sizeValue = size ?? 'default'
  const dataSize = typeof sizeValue === 'number' ? undefined : sizeValue
  // Numeric size maps to the native <input size> attribute for character-width
  // sizing (matches prod's <Input nativeInput size={number}>); string sizes drive
  // the recipe via data-size instead.
  const nativeSize = typeof sizeValue === 'number' ? sizeValue : undefined

  return (
    <AutocompletePrimitive.InputGroup
      className="a63-Autocomplete-input-group"
      data-size={dataSize}
      data-slot="autocomplete-input-group"
    >
      {startAddon ? (
        <div
          aria-hidden="true"
          className="a63-Autocomplete-start-addon"
          data-slot="autocomplete-start-addon"
        >
          {startAddon}
        </div>
      ) : null}
      <AutocompletePrimitive.Input
        className={cn('a63-Autocomplete-input', className)}
        data-has-start-addon={startAddon ? '' : undefined}
        data-slot="autocomplete-input"
        size={nativeSize}
        {...props}
      />
      {showTrigger ? (
        <AutocompleteTrigger
          className={cn('a63-Autocomplete-adornment', triggerProps?.className)}
          {...triggerProps}
        >
          <AutocompletePrimitive.Icon data-slot="autocomplete-icon">
            <ChevronsUpDownIcon />
          </AutocompletePrimitive.Icon>
        </AutocompleteTrigger>
      ) : null}
      {showClear ? (
        <AutocompleteClear
          className={cn('a63-Autocomplete-adornment', clearProps?.className)}
          {...clearProps}
        >
          <CloseIcon />
        </AutocompleteClear>
      ) : null}
    </AutocompletePrimitive.InputGroup>
  )
}

export interface AutocompletePopupProps extends AutocompletePrimitive.Popup.Props {
  align?: AutocompletePrimitive.Positioner.Props['align']
  sideOffset?: AutocompletePrimitive.Positioner.Props['sideOffset']
  alignOffset?: AutocompletePrimitive.Positioner.Props['alignOffset']
  side?: AutocompletePrimitive.Positioner.Props['side']
  anchor?: AutocompletePrimitive.Positioner.Props['anchor']
  portalProps?: AutocompletePrimitive.Portal.Props
}

export function AutocompletePopup({
  align = 'start',
  alignOffset,
  anchor,
  children,
  className,
  portalProps,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: AutocompletePopupProps): React.ReactElement {
  return (
    <AutocompletePrimitive.Portal {...portalProps}>
      <AutocompletePrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="a63-Autocomplete-positioner"
        data-slot="autocomplete-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <span className="a63-Autocomplete-surface a63-Menu-popup">
          <AutocompletePrimitive.Popup
            className={cn('a63-Autocomplete-popup', className)}
            data-slot="autocomplete-popup"
            {...props}
          >
            {children}
          </AutocompletePrimitive.Popup>
        </span>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  )
}

export function AutocompleteItem({
  children,
  className,
  ...props
}: AutocompletePrimitive.Item.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Item
      className={cn('a63-Menu-item', 'a63-Autocomplete-item', className)}
      data-slot="autocomplete-item"
      {...props}
    >
      {children}
    </AutocompletePrimitive.Item>
  )
}

export function AutocompleteSeparator({
  className,
  ...props
}: AutocompletePrimitive.Separator.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Separator
      className={cn('a63-Menu-separator', 'a63-Autocomplete-separator', className)}
      data-slot="autocomplete-separator"
      {...props}
    />
  )
}

export function AutocompleteGroup({
  className,
  ...props
}: AutocompletePrimitive.Group.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Group
      className={cn('a63-Autocomplete-group', className)}
      data-slot="autocomplete-group"
      {...props}
    />
  )
}

export function AutocompleteGroupLabel({
  className,
  ...props
}: AutocompletePrimitive.GroupLabel.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.GroupLabel
      className={cn('a63-Menu-label', 'a63-Autocomplete-group-label', className)}
      data-slot="autocomplete-group-label"
      {...props}
    />
  )
}

export function AutocompleteEmpty({
  className,
  ...props
}: AutocompletePrimitive.Empty.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Empty
      className={cn('a63-Autocomplete-empty', className)}
      data-slot="autocomplete-empty"
      {...props}
    />
  )
}

export function AutocompleteRow({
  className,
  ...props
}: AutocompletePrimitive.Row.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Row
      className={cn('a63-Autocomplete-row', className)}
      data-slot="autocomplete-row"
      {...props}
    />
  )
}

export function AutocompleteValue({
  ...props
}: AutocompletePrimitive.Value.Props): React.ReactElement {
  return <AutocompletePrimitive.Value data-slot="autocomplete-value" {...props} />
}

export function AutocompleteList({
  className,
  ...props
}: AutocompletePrimitive.List.Props): React.ReactElement {
  return (
    <ScrollArea scrollFade scrollbarGutter>
      <AutocompletePrimitive.List
        className={cn('a63-Autocomplete-list', className)}
        data-slot="autocomplete-list"
        {...props}
      />
    </ScrollArea>
  )
}

export function AutocompleteClear({
  children,
  className,
  ...props
}: AutocompletePrimitive.Clear.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Clear
      className={cn('a63-Autocomplete-adornment', className)}
      data-slot="autocomplete-clear"
      {...props}
    >
      {children ?? <CloseIcon />}
    </AutocompletePrimitive.Clear>
  )
}

export function AutocompleteStatus({
  className,
  ...props
}: AutocompletePrimitive.Status.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Status
      className={cn('a63-Autocomplete-status', className)}
      data-slot="autocomplete-status"
      {...props}
    />
  )
}

export function AutocompleteCollection({
  ...props
}: AutocompletePrimitive.Collection.Props): React.ReactElement {
  return <AutocompletePrimitive.Collection data-slot="autocomplete-collection" {...props} />
}

export function AutocompleteTrigger({
  children,
  className,
  ...props
}: AutocompletePrimitive.Trigger.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Trigger
      className={className}
      data-slot="autocomplete-trigger"
      {...props}
    >
      {children}
    </AutocompletePrimitive.Trigger>
  )
}

export const useAutocompleteFilter: typeof AutocompletePrimitive.useFilter =
  AutocompletePrimitive.useFilter

export { AutocompletePrimitive }
