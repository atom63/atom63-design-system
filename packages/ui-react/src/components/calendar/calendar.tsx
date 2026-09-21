'use client'

import type * as React from 'react'
import { DayPicker } from 'react-day-picker'

import { cn } from '../../lib/cn'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/*
 * Calendar — a faithful DS port of the react-day-picker DayPicker wrapper.
 * Every rdp element gets an `a63-Calendar-*` recipe class (calendar.css owns
 * layout + selected/today/range styling from --a63-* tokens); the nav buttons
 * mimic the DS Button via `a63-Calendar-nav-button`. Chevrons are inline SVGs
 * (matching Select / DropdownMenu) rather than icon fonts, so
 * no rdp base style.css is imported — the DS convention (no side-effect CSS).
 */
function ChevronLeftIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function ChevronsUpDownIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16">
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

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  mode = 'single',
  ...props
}: CalendarProps): React.ReactElement {
  const defaultClassNames = {
    button_next: 'a63-Calendar-nav-button',
    button_previous: 'a63-Calendar-nav-button',
    caption_label: 'a63-Calendar-caption-label',
    day: 'a63-Calendar-day',
    day_button: 'a63-Calendar-day-button',
    dropdown: 'a63-Calendar-dropdown',
    dropdown_root: 'a63-Calendar-dropdown-root',
    dropdowns: 'a63-Calendar-dropdowns',
    hidden: 'a63-Calendar-hidden',
    month: 'a63-Calendar-month',
    month_caption: 'a63-Calendar-month-caption',
    months: 'a63-Calendar-months',
    nav: 'a63-Calendar-nav',
    outside: 'a63-Calendar-outside',
    range_end: 'range-end',
    range_middle: 'range-middle',
    range_start: 'range-start',
    today: 'a63-Calendar-today',
    week_number: 'a63-Calendar-week-number',
    weekday: 'a63-Calendar-weekday',
  }

  const mergedClassNames = { ...defaultClassNames }
  if (classNames) {
    for (const key of Object.keys(defaultClassNames) as Array<keyof typeof defaultClassNames>) {
      const userClass = classNames[key]
      if (userClass) {
        mergedClassNames[key] = cn(defaultClassNames[key], userClass)
      }
    }
  }

  const defaultComponents = {
    Chevron: ({
      className: chevronClassName,
      orientation,
    }: {
      className?: string
      orientation?: 'left' | 'right' | 'up' | 'down'
    }): React.ReactElement => {
      if (orientation === 'left') {
        return <ChevronLeftIcon className={cn('a63-Calendar-chevron', chevronClassName)} />
      }
      if (orientation === 'right') {
        return <ChevronRightIcon className={cn('a63-Calendar-chevron', chevronClassName)} />
      }
      return <ChevronsUpDownIcon className={cn('a63-Calendar-chevron', chevronClassName)} />
    },
  }

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  }

  const dayPickerProps = {
    className: cn('a63-Calendar', className),
    classNames: mergedClassNames,
    components: mergedComponents,
    'data-slot': 'calendar',
    formatters: {
      formatMonthDropdown: (date: Date) => date.toLocaleString('default', { month: 'short' }),
      ...props.formatters,
    },
    mode,
    showOutsideDays,
    ...props,
  }

  return <DayPicker {...(dayPickerProps as CalendarProps)} />
}
