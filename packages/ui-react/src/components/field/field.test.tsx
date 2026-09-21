import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field'

describe('Field', () => {
  it('renders the scaffolding parts with their data-slots', () => {
    const { container } = render(
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Legend</FieldLegend>
          <Field>
            <FieldLabel htmlFor="x">Label</FieldLabel>
            <FieldContent>
              <FieldTitle>Title</FieldTitle>
              <FieldDescription>Description</FieldDescription>
            </FieldContent>
          </Field>
        </FieldSet>
      </FieldGroup>
    )

    expect(container.querySelector('[data-slot="field-group"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="field-set"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="field-legend"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="field-content"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="field-description"]')).not.toBeNull()

    const field = container.querySelector('[data-slot="field"]')
    expect(field).not.toBeNull()
    expect(field).toHaveAttribute('data-orientation', 'vertical')

    expect(container.querySelectorAll('[data-slot="field-label"]')).toHaveLength(1)
    expect(container.querySelector('[data-slot="field-title"]')).not.toBeNull()
  })

  it('reflects the requested orientation', () => {
    const { container } = render(<Field orientation="horizontal" />)
    expect(container.querySelector('[data-slot="field"]')).toHaveAttribute(
      'data-orientation',
      'horizontal'
    )
  })

  it('renders an error alert from explicit children', () => {
    const { getByRole } = render(<FieldError>Something went wrong</FieldError>)
    const alert = getByRole('alert')
    expect(alert).toHaveAttribute('data-slot', 'field-error')
    expect(alert).toHaveTextContent('Something went wrong')
  })

  it('derives the message from a single error', () => {
    const { getByRole } = render(<FieldError errors={[{ message: 'Required' }]} />)
    expect(getByRole('alert')).toHaveTextContent('Required')
  })

  it('lists de-duplicated errors when there are several', () => {
    const { container } = render(
      <FieldError errors={[{ message: 'A' }, { message: 'A' }, { message: 'B' }]} />
    )
    const items = container.querySelectorAll('li')
    expect(items.length).toBe(2)
  })

  it('renders nothing when there is no error content', () => {
    const { container } = render(<FieldError errors={[]} />)
    expect(container.querySelector('[data-slot="field-error"]')).toBeNull()
  })

  it('renders a separator with a content flag', () => {
    const { container } = render(<FieldSeparator>Or</FieldSeparator>)
    const sep = container.querySelector('[data-slot="field-separator"]')
    expect(sep).not.toBeNull()
    expect(sep).toHaveAttribute('data-content', 'true')
    expect(container.querySelector('[data-slot="field-separator-content"]')).toHaveTextContent('Or')
  })

  it('dims label and title when the field is disabled', () => {
    const { container } = render(
      <Field data-disabled="true">
        <FieldLabel htmlFor="x">Label</FieldLabel>
        <FieldTitle>Title</FieldTitle>
      </Field>
    )
    expect(container.querySelector('.a63-Field')).toHaveAttribute('data-disabled', 'true')
    expect(container.querySelector('.a63-FieldLabel')).not.toBeNull()
    expect(container.querySelector('.a63-FieldTitle')).not.toBeNull()
  })

  it('marks legend variant for CSS hooks', () => {
    const { container } = render(<FieldLegend variant="label">Name</FieldLegend>)
    expect(container.querySelector('[data-slot="field-legend"]')).toHaveAttribute(
      'data-variant',
      'label'
    )
  })
})
