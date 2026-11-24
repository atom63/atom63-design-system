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

/* A rendered FieldError is the whole invalid state: it tints the label, marks
   the control aria-invalid (which draws its danger edge) and describes it. */
export const Invalid: Story = {
  render: () => (
    <div style={{ maxWidth: 360, minWidth: 0, width: '100%' }}>
      <Field>
        <FieldLabel htmlFor="fld-name">Name</FieldLabel>
        <Input id="fld-name" />
        <FieldError errors={[{ message: 'Name is required.' }]} />
      </Field>
    </div>
  ),
}

export const MultipleErrors: Story = {
  render: () => (
    <div style={{ maxWidth: 360, minWidth: 0, width: '100%' }}>
      <Field invalid>
        <FieldLabel htmlFor="fld-pw">Password</FieldLabel>
        <Input id="fld-pw" type="password" />
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

/* `disabled` dims the label and title; the control takes its own
   `disabled`, since Field does not disable what it wraps. */
export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 360, minWidth: 0, width: '100%' }}>
      <FieldGroup>
        <Field disabled>
          <FieldLabel htmlFor="fld-disabled">Workspace URL</FieldLabel>
          <Input defaultValue="atom63.io/team" disabled id="fld-disabled" />
          <FieldDescription>Only an owner can change it.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="fld-enabled">Display name</FieldLabel>
          <Input defaultValue="Atom63" id="fld-enabled" />
          <FieldDescription>Shown to everyone in the workspace.</FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  ),
}

/* Horizontal, and responsive on both sides of its 28rem container break: in a
   wide group it sits in a row, in a narrow one it stacks. */
function OrientationFields({ id }: { id: string }) {
  return (
    <FieldGroup>
      <Field orientation="horizontal">
        <FieldLabel htmlFor={`${id}-h`}>Horizontal</FieldLabel>
        <Input id={`${id}-h`} placeholder="value" />
      </Field>
      <Field data-testid={`${id}-responsive`} orientation="responsive">
        <FieldLabel htmlFor={`${id}-r`}>Responsive</FieldLabel>
        <Input id={`${id}-r`} placeholder="value" />
      </Field>
    </FieldGroup>
  )
}

const expectDirection = (root: HTMLElement, testId: string, direction: 'row' | 'column') => {
  const field = root.querySelector(`[data-testid="${testId}"]`)
  if (!field) throw new Error(`No ${testId} field`)
  const actual = getComputedStyle(field).flexDirection
  if (actual !== direction)
    throw new Error(`${testId}: expected flex-direction ${direction}, got ${actual}`)
}

export const Orientations: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, minWidth: 0, width: '100%' }}>
      <div style={{ maxWidth: 560, minWidth: 0, width: '100%' }}>
        <OrientationFields id="fld-wide" />
      </div>
      <div style={{ maxWidth: 320, minWidth: 0, width: '100%' }}>
        <OrientationFields id="fld-narrow" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    expectDirection(canvasElement, 'fld-wide-responsive', 'row')
    expectDirection(canvasElement, 'fld-narrow-responsive', 'column')
  },
}

/* At phone width (the visual project captures a Phone story at 390px) a
   responsive Field stacks, a horizontal one keeps its row and the field
   stays inside the screen. */
export const Phone: Story = {
  render: () => (
    <UIProvider designLanguage="web" input="touch">
      <div data-testid="phone" style={{ minWidth: 0, width: '100%' }}>
        <FieldGroup>
          <Field data-testid="phone-horizontal" orientation="horizontal">
            <FieldLabel htmlFor="fld-phone-h">Display name</FieldLabel>
            <Input id="fld-phone-h" placeholder="Atom63" />
          </Field>
          <Field data-testid="phone-responsive" orientation="responsive">
            <FieldLabel htmlFor="fld-phone-r">Workspace URL</FieldLabel>
            <Input id="fld-phone-r" placeholder="atom63.io/team" />
            <FieldDescription>Shown to everyone in the workspace.</FieldDescription>
          </Field>
        </FieldGroup>
      </div>
    </UIProvider>
  ),
  play: async ({ canvasElement }) => {
    expectDirection(canvasElement, 'phone-horizontal', 'row')
    if (canvasElement.ownerDocument.documentElement.clientWidth <= 448)
      expectDirection(canvasElement, 'phone-responsive', 'column')
    const frame = canvasElement.querySelector('[data-testid="phone"]')
    const limit = (frame?.getBoundingClientRect().right ?? 0) + 1
    for (const input of canvasElement.querySelectorAll('input'))
      if (input.getBoundingClientRect().right > limit)
        throw new Error(`${input.id} overflows the phone column`)
  },
}

const LONG_LABEL = 'Donaudampfschifffahrtsgesellschaftskapitän 设计系统的长标签文本'
const LONG_ERROR =
  'Diese Arbeitsbereichsadresse ist bereits vergeben 此地址已被占用 https://atom63.io/workspacesaverylongunbrokenworkspaceaddressthatkeepsgoing'

/* Right to left and long strings: a vertical and a horizontal Field in Arabic,
   then long German, CJK and an unbroken URL in the label, description and a
   wrapping error. Nothing grows past the column. */
export const RightToLeftAndLongText: Story = {
  render: () => (
    <div data-testid="long" style={{ display: 'grid', gap: 24, maxWidth: 360, minWidth: 0 }}>
      <UIProvider dir="rtl">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fld-rtl-v">البريد الإلكتروني</FieldLabel>
            <Input id="fld-rtl-v" placeholder="you@atom63.io" type="email" />
            <FieldDescription>نرسل إليك رسائل حول الإصدارات فقط.</FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="fld-rtl-h">الاسم</FieldLabel>
            <Input id="fld-rtl-h" defaultValue="ليلى أحمد" />
          </Field>
          <Field>
            <FieldLabel htmlFor="fld-rtl-e">رابط مساحة العمل</FieldLabel>
            <Input id="fld-rtl-e" />
            <FieldError errors={[{ message: 'هذا العنوان مستخدم بالفعل، اختر عنوانًا آخر.' }]} />
          </Field>
        </FieldGroup>
      </UIProvider>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="fld-long-h">{LONG_LABEL}</FieldLabel>
          <Input id="fld-long-h" />
        </Field>
        <Field>
          <FieldLabel htmlFor="fld-long-v">{LONG_LABEL}</FieldLabel>
          <Input id="fld-long-v" />
          <FieldDescription>{LONG_ERROR}</FieldDescription>
          <FieldError errors={[{ message: LONG_ERROR }]} />
        </Field>
      </FieldGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('[data-testid="long"]')
    if (!frame) throw new Error('No frame')
    const column = frame.getBoundingClientRect()
    for (const part of frame.querySelectorAll('[data-slot]')) {
      const box = part.getBoundingClientRect()
      if (
        box.right > column.right + 1 ||
        box.left < column.left - 1 ||
        part.scrollWidth > part.clientWidth + 1
      )
        throw new Error(`${part.getAttribute('data-slot')} grows past the column`)
    }
  },
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
                  <Field>
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
