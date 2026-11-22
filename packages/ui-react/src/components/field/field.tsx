'use client'

import * as React from 'react'
import type { FieldLegendVariant, FieldOrientation } from '@atom63/ui-foundation'

import { cn } from '../../lib/cn'
import { mergeRefs } from '../../lib/merge-refs'
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
  /** Tints the label and marks the control `aria-invalid`. A rendered
   *  `FieldError` sets the same state, so you do not need both. */
  invalid?: boolean
  /** Dims the label and title. Set `disabled` on the control as well; Field
   *  does not disable what it wraps. */
  disabled?: boolean
}

type FieldPartKind = 'description' | 'error'

interface FieldContextValue {
  register: (id: string, kind: FieldPartKind) => () => void
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

const CONTROL_SELECTOR =
  'input:not([type="hidden"]), select, textarea, [role="combobox"], [role="checkbox"], [role="switch"], [role="radiogroup"], [role="slider"]'

/* The control a Field describes: the element its label points at, or else
 * the first form control inside the field. */
function findControl(root: HTMLElement): HTMLElement | null {
  const label = root.querySelector<HTMLLabelElement>('label[for]')
  const labelled = label ? root.ownerDocument.getElementById(label.htmlFor) : null
  return labelled ?? root.querySelector<HTMLElement>(CONTROL_SELECTOR)
}

/* Gives a FieldDescription or FieldError an id and, while it renders, lists it
 * on the enclosing Field so the control is described by it. */
function useFieldPart(kind: FieldPartKind, idProp: string | undefined, active: boolean): string {
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const field = React.useContext(FieldContext)
  React.useLayoutEffect(
    () => (active ? field?.register(id, kind) : undefined),
    [active, field, id, kind]
  )
  return id
}

export function Field({
  className,
  disabled = false,
  invalid = false,
  orientation = 'vertical',
  ref,
  ...props
}: FieldProps): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const [parts, setParts] = React.useState<Array<{ id: string; kind: FieldPartKind }>>([])
  const context = React.useMemo<FieldContextValue>(
    () => ({
      register: (id, kind) => {
        setParts(current => [...current, { id, kind }])
        return () => setParts(current => current.filter(part => part.id !== id))
      },
    }),
    []
  )

  const isInvalid = invalid || parts.some(part => part.kind === 'error')

  // Field wraps any control (Input, Select, Checkbox...), so it links the
  // description and error to the control through the DOM, keeping any
  // aria-describedby the control already has, and marks it invalid.
  React.useLayoutEffect(() => {
    const control = rootRef.current ? findControl(rootRef.current) : null
    if (!control || (parts.length === 0 && !isInvalid)) {
      return undefined
    }
    const existing = (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
    const added = parts.map(part => part.id).filter(id => !existing.includes(id))
    if (existing.length + added.length > 0) {
      control.setAttribute('aria-describedby', [...existing, ...added].join(' '))
    }
    const markInvalid = isInvalid && !control.hasAttribute('aria-invalid')
    if (markInvalid) {
      control.setAttribute('aria-invalid', 'true')
    }
    return () => {
      const remaining = (control.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(id => id && !added.includes(id))
      if (remaining.length > 0) {
        control.setAttribute('aria-describedby', remaining.join(' '))
      } else {
        control.removeAttribute('aria-describedby')
      }
      if (markInvalid) {
        control.removeAttribute('aria-invalid')
      }
    }
  }, [isInvalid, parts])

  return (
    <FieldContext.Provider value={context}>
      <div
        className={cn('a63-Field', className)}
        data-slot="field"
        data-orientation={orientation}
        data-invalid={isInvalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        ref={React.useMemo(() => mergeRefs(rootRef, ref), [ref])}
        {...props}
      />
    </FieldContext.Provider>
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
  id: idProp,
  ...props
}: FieldDescriptionProps): React.ReactElement {
  const id = useFieldPart('description', idProp, true)
  return (
    <p
      className={cn('a63-FieldDescription', className)}
      data-slot="field-description"
      id={id}
      {...props}
    />
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
  id: idProp,
  ...props
}: FieldErrorProps): React.ReactElement | null {
  const content = React.useMemo(() => {
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
  const id = useFieldPart('error', idProp, Boolean(content))

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      className={cn('a63-FieldError', className)}
      data-slot="field-error"
      id={id}
      {...props}
    >
      {content}
    </div>
  )
}
