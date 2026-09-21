'use client'

import type * as React from 'react'
import { cn } from '../../lib/cn'

/**
 * The rich preview-card look ported from the old `@atom63/theme` appearance
 * controls, with shadcn tokens translated to the DS `--a63-*` layer.
 */
const VISUAL_CHOICE_BUTTON_CLASS =
  'group relative flex min-h-[5.5rem] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[calc(var(--radius-lg)+2px)] border border-[var(--a63-border-subtle)] bg-[var(--a63-surface-panel)] px-3 py-3 text-center text-[var(--a63-text-secondary)] transition-[background-color,border-color,box-shadow,color,transform] duration-150 ease-out motion-reduce:transition-none hover:-translate-y-px hover:border-[var(--a63-border-control)] hover:text-[var(--a63-text-primary)] hover:shadow-sm motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--a63-focus-ring)] active:translate-y-0 active:scale-[0.99] motion-reduce:active:scale-100 data-[state=checked]:border-[var(--a63-action-primary)] data-[state=checked]:bg-[color-mix(in_oklch,var(--a63-action-primary)_8%,transparent)] data-[state=checked]:text-[var(--a63-text-primary)] data-[state=checked]:shadow-[0_0_0_1px_var(--a63-action-primary)]'

const COLUMN_CLASS = {
  3: 'grid-cols-[repeat(auto-fit,minmax(min(4.5rem,100%),1fr))]',
  4: 'grid-cols-[repeat(auto-fit,minmax(min(4.5rem,100%),1fr))]',
} as const

export interface VisualChoiceOption<T extends string> {
  id: T
  name: string
  renderVisual: (selected: boolean) => React.ReactNode
}

export interface VisualChoiceControlProps<T extends string> {
  className?: string
  columns?: 3 | 4
  /** Accessible name for the group (sr-only `<legend>`), e.g. the axis title. */
  label: string
  onChange: (value: T) => void
  options: readonly VisualChoiceOption<T>[]
  value: T
}

/*
 * VisualChoiceControl — a card grid where each option renders its own rich
 * preview (a window mockup, an "Aa" in a typeface, a radius box, …). Cards use
 * `aria-pressed` toggle semantics rather than role="radio" on a button; the
 * label is each card's accessible name. The
 * `<fieldset>` group is named by an sr-only `<legend>` (the `label` prop).
 */
export function VisualChoiceControl<T extends string>({
  className,
  columns = 4,
  label,
  onChange,
  options,
  value,
}: VisualChoiceControlProps<T>): React.ReactElement {
  return (
    <fieldset
      className={cn('grid min-w-0 gap-2 border-0 p-0', COLUMN_CLASS[columns], className)}
      data-slot="visual-choice-control"
    >
      <legend className="sr-only">{label}</legend>
      {options.map(option => {
        const selected = option.id === value
        return (
          <button
            aria-pressed={selected}
            className={VISUAL_CHOICE_BUTTON_CLASS}
            data-slot="visual-choice-option"
            data-state={selected ? 'checked' : 'unchecked'}
            key={option.id}
            onClick={() => onChange(option.id)}
            type="button"
          >
            {option.renderVisual(selected)}
            <span className="max-w-full truncate text-xs leading-none font-medium">
              {option.name}
            </span>
          </button>
        )
      })}
    </fieldset>
  )
}
