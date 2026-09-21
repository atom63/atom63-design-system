'use client'

import { searchFieldContract, type SearchFieldState } from '@atom63/ui-foundation'
import * as React from 'react'

import { cn } from '../../lib/cn'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  type InputGroupInputProps,
} from '../input'

export interface SearchFieldProps extends Omit<
  InputGroupInputProps,
  'className' | 'defaultValue' | 'onChange' | 'type' | 'value'
> {
  clearLabel?: string
  className?: string
  defaultValue?: string
  inputClassName?: string
  onClear?: () => void
  onValueChange?: (value: string) => void
  value?: string
}

function SearchIcon() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.25 10.25 3 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg aria-hidden fill="none" height="14" viewBox="0 0 16 16" width="14">
      <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  )
}

export function SearchField({
  autoComplete = 'off',
  className,
  clearLabel = 'Clear search',
  defaultValue = '',
  disabled,
  inputClassName,
  onClear,
  onValueChange,
  spellCheck = false,
  value,
  ...props
}: SearchFieldProps): React.ReactElement {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = isControlled ? value : internalValue
  const state: SearchFieldState = disabled
    ? 'disabled'
    : currentValue.length > 0
      ? 'query'
      : searchFieldContract.states[0]

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  return (
    <InputGroup
      className={cn('a63-SearchField', className)}
      data-search-state={state}
      data-slot="search-field"
      disabled={disabled}
    >
      <InputGroupAddon data-slot="search-field-icon">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        {...props}
        autoComplete={autoComplete}
        inputClassName={inputClassName}
        onChange={event => updateValue(event.currentTarget.value)}
        ref={inputRef}
        spellCheck={spellCheck}
        type="search"
        value={currentValue}
      />
      {currentValue.length > 0 && !disabled ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={clearLabel}
            data-slot="search-field-clear"
            onClick={() => {
              updateValue('')
              onClear?.()
              inputRef.current?.focus()
            }}
            type="button"
          >
            <ClearIcon />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
