import { fieldContract, themes } from '@atom63/ui-foundation'
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
  Input,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

const meta = {
  title: 'UI React/Field',
  component: Field,
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 360, minWidth: 0, width: '100%' }}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fld-email">Email</FieldLabel>
          <Input id="fld-email" placeholder="you@atom63.io" type="email" />
          <FieldDescription>We only email you about releases.</FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  ),
}

export const Invalid: Story = {
  render: () => (
    <div style={{ maxWidth: 360, minWidth: 0, width: '100%' }}>
      <Field data-invalid="true">
        <FieldLabel htmlFor="fld-name">Name</FieldLabel>
        <Input id="fld-name" invalid />
        <FieldError errors={[{ message: 'Name is required.' }]} />
      </Field>
    </div>
  ),
}

export const MultipleErrors: Story = {
  render: () => (
    <div style={{ maxWidth: 360, minWidth: 0, width: '100%' }}>
      <Field data-invalid="true">
        <FieldLabel htmlFor="fld-pw">Password</FieldLabel>
        <Input id="fld-pw" invalid type="password" />
        <FieldError
          errors={[
            { message: 'Must be at least 8 characters.' },
            { message: 'Must include a number.' },
          ]}
        />
      </Field>
    </div>
  ),
}

export const Orientations: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 420, minWidth: 0, width: '100%' }}>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="fld-h">Horizontal</FieldLabel>
          <Input id="fld-h" placeholder="value" />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="fld-r">Responsive</FieldLabel>
          <Input id="fld-r" placeholder="value" />
        </Field>
      </FieldGroup>
    </div>
  ),
}

export const FieldsetWithSeparator: Story = {
  render: () => (
    <div style={{ maxWidth: 360, minWidth: 0, width: '100%' }}>
      <FieldSet>
        <FieldLegend>Contact</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="fld-first">First name</FieldLabel>
              <Input id="fld-first" />
            </FieldContent>
          </Field>
          <FieldSeparator>and</FieldSeparator>
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="fld-last">Last name</FieldLabel>
              <Input id="fld-last" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  ),
}

export const LegendVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 360, minWidth: 0, width: '100%' }}>
      <FieldSet>
        <FieldLegend variant="legend">Legend (default)</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fld-lg-a">City</FieldLabel>
            <Input id="fld-lg-a" />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">Label variant</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fld-lg-b">City</FieldLabel>
            <Input id="fld-lg-b" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'start',
                background: 'var(--a63-surface-panel)',
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'grid',
                gap: 12,
                gridTemplateColumns: '7rem minmax(0, 1fr)',
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>
                {theme} / {mode}
              </span>
              <div style={{ maxWidth: 280, minWidth: 0, width: '100%' }}>
                <FieldGroup>
                  <Field data-invalid="true">
                    <FieldLabel htmlFor={`fld-${theme}-${mode}`}>Email</FieldLabel>
                    <Input id={`fld-${theme}-${mode}`} invalid placeholder="you@atom63.io" />
                    <FieldError errors={[{ message: 'Enter a valid email.' }]} />
                  </Field>
                </FieldGroup>
              </div>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        ['Web', { density: 'comfortable', designLanguage: 'web', input: 'pointer' }],
        ['iOS touch', { density: 'comfortable', designLanguage: 'ios', input: 'touch' }],
        ['Compact extension', { density: 'compact', designLanguage: 'web', input: 'pointer' }],
      ].map(([label, props]) => (
        <UIProvider key={label as string} {...(props as ComponentProps<typeof UIProvider>)}>
          <div style={{ background: 'var(--a63-surface-panel)', minWidth: 0, padding: 12 }}>
            <Field style={{ maxWidth: 320, width: '100%' }}>
              <FieldLabel htmlFor={`field-${label as string}`}>{label as string}</FieldLabel>
              <Input id={`field-${label as string}`} placeholder="you@atom63.io" />
              <FieldDescription>Endpoint-aware control geometry.</FieldDescription>
            </Field>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(fieldContract, null, 2)}
    </pre>
  ),
}
