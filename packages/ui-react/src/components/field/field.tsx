'use client'

import type * as React from 'react'
import { useMemo } from 'react'
import type { FieldLegendVariant, FieldOrientation } from '@atom63/ui-foundation'

import { cn } from '../../lib/cn'
import { Label } from '../label'
import { Separator } from '../separator'

/* Field — layout/label/description/error scaffolding for form controls.
 * Faithful port of prod @atom63/ui field.tsx: every part + prop kept, the
 * Tailwind utilities recomposed into `.a63-Field*` recipes reading --a63-*
 * tokens + `data-slot` / `data-orientation` / `data-variant` hooks the CSS
 * targets. The parts stay unstyled containers; the recipe owns spacing/color. */

export type FieldSetProps = React.ComponentProps<'fieldset'>

export function FieldSet({ className, ...props }: FieldSetProps): React.ReactElement {
  return <fieldset className={cn('a63-FieldSet', className)} data-slot="field-set" {...props} />
}

export type FieldLegendProps = React.ComponentProps<'legend'> & {
  variant?: FieldLegendVariant
}

export function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: FieldLegendProps): React.ReactElement {
  return (
    <legend
      className={cn('a63-FieldLegend', className)}
      data-slot="field-legend"
      data-variant={variant}
      {...props}
    />
  )
}

export type FieldGroupProps = React.ComponentProps<'div'>

export function FieldGroup({ className, ...props }: FieldGroupProps): React.ReactElement {
  return <div className={cn('a63-FieldGroup', className)} data-slot="field-group" {...props} />
}

export type { FieldOrientation }

export type FieldProps = React.ComponentProps<'div'> & {
  orientation?: FieldOrientation
}

export function Field({
  className,
  orientation = 'vertical',
  ...props
}: FieldProps): React.ReactElement {
  return (
    <div
      className={cn('a63-Field', className)}
      data-slot="field"
      data-orientation={orientation}
      {...props}
    />
  )
}

export type FieldContentProps = React.ComponentProps<'div'>

export function FieldContent({ className, ...props }: FieldContentProps): React.ReactElement {
  return <div className={cn('a63-FieldContent', className)} data-slot="field-content" {...props} />
}

export type FieldLabelProps = React.ComponentProps<typeof Label>

export function FieldLabel({ className, ...props }: FieldLabelProps): React.ReactElement {
  return <Label className={cn('a63-FieldLabel', className)} data-slot="field-label" {...props} />
}

export type FieldTitleProps = React.ComponentProps<'div'>

export function FieldTitle({ className, ...props }: FieldTitleProps): React.ReactElement {
  return <div className={cn('a63-FieldTitle', className)} data-slot="field-title" {...props} />
}

export type FieldDescriptionProps = React.ComponentProps<'p'>

export function FieldDescription({
  className,
  ...props
}: FieldDescriptionProps): React.ReactElement {
  return (
    <p className={cn('a63-FieldDescription', className)} data-slot="field-description" {...props} />
  )
}

export type FieldSeparatorProps = React.ComponentProps<'div'> & {
  children?: React.ReactNode
}

export function FieldSeparator({
  children,
  className,
  ...props
}: FieldSeparatorProps): React.ReactElement {
  return (
    <div
      className={cn('a63-FieldSeparator', className)}
      data-slot="field-separator"
      data-content={!!children}
      {...props}
    >
      <Separator className="a63-FieldSeparator-line" />
      {children && (
        <span className="a63-FieldSeparator-content" data-slot="field-separator-content">
          {children}
        </span>
      )}
    </div>
  )
}

export type FieldErrorProps = React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}

export function FieldError({
  className,
  children,
  errors,
  ...props
}: FieldErrorProps): React.ReactElement | null {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [...new Map(errors.map(error => [error?.message, error])).values()]

    if (uniqueErrors?.length === 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="a63-FieldError-list">
        {uniqueErrors.map(error => error?.message && <li key={error.message}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      className={cn('a63-FieldError', className)}
      data-slot="field-error"
      {...props}
    >
      {content}
    </div>
  )
}
