'use client'

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import type * as React from 'react'

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
  type = 'single',
  value,
  ...props
}: AccordionProps): React.ReactElement {
  const multiple = type === 'multiple'

  return (
    <AccordionPrimitive.Root
      className={cn('a63-Accordion')}
      data-slot="accordion"
      defaultValue={toValueArray(defaultValue)}
      multiple={multiple}
      onValueChange={
        onValueChange
          ? nextValue => onValueChange(multiple ? nextValue : (nextValue.at(0) ?? ''))
          : undefined
      }
      value={toValueArray(value)}
      {...props}
    />
  )
}

export function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Item
      className={cn('a63-Accordion-item', className)}
      data-slot="accordion-item"
      {...props}
    />
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
  return (
    <AccordionPrimitive.Header className="a63-Accordion-header">
      <AccordionPrimitive.Trigger
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
  ...props
}: AccordionPrimitive.Panel.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Panel
      className="a63-Accordion-panel"
      data-slot="accordion-content"
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
