export const calendarSelectionModes = ['single', 'multiple', 'range'] as const

export const calendarSlots = [
  'calendar',
  'calendar-months',
  'calendar-month',
  'calendar-month-caption',
  'calendar-caption-label',
  'calendar-nav',
  'calendar-nav-button',
  'calendar-chevron',
  'calendar-dropdowns',
  'calendar-dropdown-root',
  'calendar-dropdown',
  'calendar-weekday',
  'calendar-week-number',
  'calendar-day',
  'calendar-day-button',
] as const

export const calendarStates = [
  'rest',
  'hover',
  'focus-visible',
  'today',
  'selected',
  'range-start',
  'range-middle',
  'range-end',
  'outside',
  'disabled',
] as const

export const calendarVisualArchetypes = ['surface', 'action', 'choice'] as const

export type CalendarSelectionMode = (typeof calendarSelectionModes)[number]
export type CalendarSlot = (typeof calendarSlots)[number]
export type CalendarState = (typeof calendarStates)[number]
export type CalendarVisualArchetype = (typeof calendarVisualArchetypes)[number]

export interface CalendarContract {
  defaultSelectionMode: CalendarSelectionMode
  selectionModes: readonly CalendarSelectionMode[]
  slots: readonly CalendarSlot[]
  states: readonly CalendarState[]
  visualArchetypes: readonly CalendarVisualArchetype[]
}

export const calendarContract = {
  defaultSelectionMode: 'single',
  selectionModes: calendarSelectionModes,
  slots: calendarSlots,
  states: calendarStates,
  visualArchetypes: calendarVisualArchetypes,
} satisfies CalendarContract
