import { render } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { Input } from '../input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'

function DemoForm({ error }: { error?: string }) {
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
              <FormDescription>Your public handle.</FormDescription>
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

    const control = container.querySelector('[data-slot="form-control"]')
    expect(control).not.toBeNull()
    expect(control).toHaveAttribute('id', htmlFor ?? '')
    expect(control).toHaveAttribute('aria-invalid', 'false')

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
    expect(message).toHaveAttribute('aria-live', 'polite')

    expect(container.querySelector('[data-slot="form-label"]')).toHaveAttribute(
      'data-error',
      'true'
    )
    expect(container.querySelector('[data-slot="form-control"]')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })
})
