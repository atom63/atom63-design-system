import { render } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { Checkbox } from '../checkbox'
import { Input } from '../input'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '../select'
import { Textarea } from '../textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'

function DemoForm({ description = true, error }: { description?: boolean; error?: string }) {
  const methods = useForm<{ username: string }>({
    defaultValues: { username: '' },
    errors: error ? { username: { type: 'manual', message: error } } : undefined,
  })

  return (
    <Form {...methods}>
      <form>
        <FormField
          control={methods.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {description ? <FormDescription>Your public handle.</FormDescription> : null}
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

describe('Form', () => {
  it('renders the label, control, and description wired by useFormField', () => {
    const { container } = render(<DemoForm />)

    const item = container.querySelector('[data-slot="form-item"]')
    expect(item).not.toBeNull()

    const label = container.querySelector('[data-slot="form-label"]')
    expect(label).toHaveTextContent('Username')
    // label htmlFor points at the control id
    const htmlFor = label?.getAttribute('for')

    const control = container.querySelector('[data-form-control]')
    expect(control).not.toBeNull()
    // The input keeps its own contract slot under FormControl.
    expect(control).toHaveAttribute('data-slot', 'input')
    expect(control).toHaveAttribute('id', htmlFor ?? '')
    expect(control).not.toHaveAttribute('aria-invalid')

    const description = container.querySelector('[data-slot="form-description"]')
    expect(description).toHaveTextContent('Your public handle.')
    // control describes itself with the description id
    expect(control?.getAttribute('aria-describedby')).toContain(
      description?.getAttribute('id') ?? ''
    )

    // no error → no message rendered
    expect(container.querySelector('[data-slot="form-message"]')).toBeNull()
  })

  it('surfaces a field error as the form message and flips label + control state', () => {
    const { container } = render(<DemoForm error="Username is taken" />)

    const message = container.querySelector('[data-slot="form-message"]')
    expect(message).toHaveTextContent('Username is taken')
    expect(message).toHaveAttribute('role', 'alert')
    expect(message).not.toHaveAttribute('aria-live')

    expect(container.querySelector('[data-slot="form-label"]')).toHaveAttribute(
      'data-error',
      'true'
    )
    expect(container.querySelector('[data-form-control]')).toHaveAttribute('aria-invalid', 'true')
    expect(container.querySelector('[data-slot="input-control"]')).toHaveAttribute('data-invalid')
  })

  it('renders a static message as plain text, not an alert', () => {
    function StaticMessage() {
      const methods = useForm<{ username: string }>({ defaultValues: { username: '' } })
      return (
        <Form {...methods}>
          <FormField
            control={methods.control}
            name="username"
            render={() => (
              <FormItem>
                <FormMessage>Letters and numbers only.</FormMessage>
              </FormItem>
            )}
          />
        </Form>
      )
    }
    const { container } = render(<StaticMessage />)
    const message = container.querySelector('[data-slot="form-message"]')
    expect(message).toHaveTextContent('Letters and numbers only.')
    expect(message).not.toHaveAttribute('role')
  })

  it('references only the parts that render', () => {
    const { container, rerender } = render(<DemoForm description={false} />)
    const control = () => container.querySelector('[data-form-control]')
    expect(control()).not.toHaveAttribute('aria-describedby')

    rerender(<DemoForm description={false} error="Username is taken" />)
    const message = container.querySelector('[data-slot="form-message"]')
    expect(control()?.getAttribute('aria-describedby')).toBe(message?.getAttribute('id'))

    rerender(<DemoForm />)
    const description = container.querySelector('[data-slot="form-description"]')
    expect(control()?.getAttribute('aria-describedby')).toBe(description?.getAttribute('id'))
  })
})

type ComposedValues = { plan: string; bio: string; terms: boolean }

/* FormControl must keep each control's own data-slot and wire id and
   aria-describedby onto the element the label points at. */
function ComposedForm({ error }: { error?: boolean }) {
  const methods = useForm<ComposedValues>({
    defaultValues: { plan: 'free', bio: '', terms: false },
    errors: error
      ? {
          plan: { type: 'manual', message: 'Pick a plan.' },
          bio: { type: 'manual', message: 'Add a bio.' },
          terms: { type: 'manual', message: 'Accept the terms.' },
        }
      : undefined,
  })
  const items = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
  ]

  return (
    <Form {...methods}>
      <form>
        <FormField
          control={methods.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <Select items={items} onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectPopup>
                  {items.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <FormDescription>Billed monthly.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>Shown on your profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>Accept the terms</FormLabel>
              <FormDescription>Required to continue.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

describe('Form composition', () => {
  const cases = [
    ['Select', 'select-trigger'],
    ['Textarea', 'textarea'],
    ['Checkbox', 'checkbox'],
  ] as const

  for (const [index, [name, slot]] of cases.entries()) {
    it(`keeps the ${name} slot and wires its label and description`, () => {
      const { container } = render(<ComposedForm />)
      const item = container.querySelectorAll('[data-slot="form-item"]')[index]
      const control = item?.querySelector('[data-form-control]')
      expect(control).toHaveAttribute('data-slot', slot)
      // The label points at the control; Base UI Checkbox moves the id onto its
      // native input, which sits right after the visible control.
      const labelled = document.getElementById(
        item?.querySelector('[data-slot="form-label"]')?.getAttribute('for') ?? ''
      )
      expect(labelled).not.toBeNull()
      expect([control, control?.nextElementSibling]).toContain(labelled)
      const description = item?.querySelector('[data-slot="form-description"]')
      expect(control?.getAttribute('aria-describedby')).toBe(description?.getAttribute('id'))
      expect(control).not.toHaveAttribute('aria-invalid')
    })

    it(`marks the ${name} invalid and describes it by the message`, () => {
      const { container } = render(<ComposedForm error />)
      const item = container.querySelectorAll('[data-slot="form-item"]')[index]
      const control = item?.querySelector('[data-form-control]')
      expect(control).toHaveAttribute('data-slot', slot)
      expect(control).toHaveAttribute('aria-invalid', 'true')
      const message = item?.querySelector('[data-slot="form-message"]')
      expect(control?.getAttribute('aria-describedby')).toContain(message?.getAttribute('id'))
    })
  }
})
