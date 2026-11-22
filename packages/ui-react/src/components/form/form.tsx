'use client'

import { useRender } from '@base-ui/react/use-render'
import * as React from 'react'
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form'

import { cn } from '../../lib/cn'
import { Label } from '../label'

/* Form — react-hook-form wrappers. Faithful port of prod @atom63/ui form.tsx:
 * the Controller integration, useFormField id-wiring hook, and Base UI
 * `use-render` FormControl slot are kept exactly. Only the presentational
 * classes are recomposed into `.a63-Form*` recipes reading --a63-* tokens. */

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }
  if (!itemContext) {
    throw new Error('useFormField should be used within <FormItem>')
  }

  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  const { hasDescription, id } = itemContext

  return {
    id,
    hasDescription,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  /** Whether a FormDescription renders in the item, so the control lists its id. */
  hasDescription: boolean
  id: string
  setHasDescription: (value: boolean) => void
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId()
  const [hasDescription, setHasDescription] = React.useState(false)
  const context = React.useMemo(
    () => ({ hasDescription, id, setHasDescription }),
    [hasDescription, id]
  )

  return (
    <FormItemContext.Provider value={context}>
      <div className={cn('a63-FormItem', className)} data-slot="form-item" {...props} />
    </FormItemContext.Provider>
  )
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      className={cn('a63-FormLabel', className)}
      data-error={!!error}
      data-slot="form-label"
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({
  children,
  ...props
}: React.ComponentProps<'div'> & { children: React.ReactElement }) {
  const { error, formItemId, formDescriptionId, formMessageId, hasDescription } = useFormField()
  const describedBy =
    [hasDescription ? formDescriptionId : null, error ? formMessageId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return useRender({
    defaultTagName: 'div',
    props: {
      'aria-describedby': describedBy,
      'aria-invalid': !!error,
      'data-slot': 'form-control',
      id: formItemId,
      ...props,
    },
    render: children,
  })
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField()
  const setHasDescription = React.useContext(FormItemContext)?.setHasDescription
  React.useLayoutEffect(() => {
    setHasDescription?.(true)
    return () => setHasDescription?.(false)
  }, [setHasDescription])

  return (
    <p
      className={cn('a63-FormDescription', className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? '') : props.children

  if (!body) {
    return null
  }

  return (
    <p
      aria-live="polite"
      className={cn('a63-FormMessage', className)}
      data-slot="form-message"
      id={formMessageId}
      role="alert"
      {...props}
    >
      {body}
    </p>
  )
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
