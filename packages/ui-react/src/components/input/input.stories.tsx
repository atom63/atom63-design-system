import { inputContract, inputGroupContract, inputSizes, themes } from '@atom63/ui-foundation'
import { Search, X } from 'lucide-react'
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties, ReactNode } from 'react'

const meta = {
  title: 'UI React/Input',
  component: Input,
  argTypes: {
    size: {
      control: 'select',
      options: inputSizes,
    },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    shadow: { control: 'boolean' },
    inputClassName: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    disabled: false,
    invalid: false,
    shadow: true,
    placeholder: 'you@atom63.io',
    size: 'md',
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

function PreviewCard({
  children,
  label,
  style,
}: {
  children: ReactNode
  label: string
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: '1rem',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: '0.875rem',
        padding: '1rem',
        ...style,
      }}
    >
      <div
        style={{
          color: 'var(--a63-text-secondary)',
          fontFamily: 'Geist Mono, monospace',
          fontSize: '0.75rem',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function EnvironmentShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer" mode="light">
        <PreviewCard label="web / light / pointer">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="web" input="pointer" mode="dark">
        <PreviewCard label="web / dark / pointer">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="light">
        <PreviewCard label="ios / light / touch">{children}</PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="dark">
        <PreviewCard label="ios / dark / touch">{children}</PreviewCard>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer" mode="light">
        <PreviewCard label="extension / light / compact">{children}</PreviewCard>
      </UIProvider>
    </div>
  )
}

export const Playground: Story = {
  render: args => (
    <EnvironmentShell>
      <Input {...args} style={{ width: '100%' }} />
    </EnvironmentShell>
  ),
}

export const Sizes: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {inputSizes.map(size => (
          <Input
            aria-label="Example text field"
            defaultValue={size}
            key={size}
            size={size}
            style={{ width: '100%' }}
          />
        ))}
      </div>
    </EnvironmentShell>
  ),
}

export const States: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <Input
          aria-label="Example text field"
          placeholder="Placeholder"
          style={{ width: '100%' }}
        />
        <Input
          aria-label="Example text field"
          defaultValue="Filled value"
          style={{ width: '100%' }}
        />
        <Input
          aria-label="Example text field, invalid"
          defaultValue="Invalid entry"
          invalid
          style={{ width: '100%' }}
        />
        <Input
          aria-label="Example text field, disabled"
          defaultValue="Disabled"
          disabled
          style={{ width: '100%' }}
        />
      </div>
    </EnvironmentShell>
  ),
}

/* Composable InputGroup: leading/trailing addons (icons, buttons, prefix text)
   sharing the field chrome. The group owns the chrome; the field nests unstyled. */
export const Group: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <InputGroup style={{ width: '100%' }}>
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput aria-label="Example text field" placeholder="Search…" />
        </InputGroup>

        <InputGroup style={{ width: '100%' }}>
          <InputGroupInput aria-label="Example text field" defaultValue="Draft note" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton aria-label="Clear" size="icon-xs" type="button">
              <X aria-hidden />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <InputGroup style={{ width: '100%' }}>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label="Example text field" defaultValue="atom63.io" />
        </InputGroup>

        <InputGroup invalid style={{ width: '100%' }}>
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput aria-label="Example text field" defaultValue="bad query" />
        </InputGroup>

        <InputGroup disabled style={{ width: '100%' }}>
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput aria-label="Example text field" defaultValue="Disabled" />
        </InputGroup>
      </div>
    </EnvironmentShell>
  ),
}

/* Prod parity: a numeric `size` forwards to the native char-width attribute
   (`<input size={n}>`) while the visual ramp stays at the default step, so the
   field auto-sizes to N characters rather than filling its container. */
export const NumericSize: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
        <Input aria-label="Example text field" defaultValue="4" size={4} />
        <Input aria-label="Example text field" defaultValue="10 chars" size={10} />
        <Input aria-label="Example text field" placeholder="20-char field" size={20} />
      </div>
    </EnvironmentShell>
  ),
}

/* Prod parity for field chrome: `shadow={false}` drops the recessed
   `--field-shadow` for inputs on translucent/flat surfaces; `inputClassName`
   merges onto the inner `.a63-Input-field` for field-level tweaks the control-box
   `className` can't reach (here `text-center`). For a LEADING ICON, reach for the
   InputGroup composition (below) — the addon controls the icon→text gap, rather
   than an absolute icon + padding hack. */
export const FieldChrome: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <Input
          aria-label="Example text field"
          defaultValue="With recessed shadow"
          style={{ width: '100%' }}
        />
        <Input
          aria-label="Example text field"
          defaultValue="Flat (shadow={false})"
          shadow={false}
          style={{ width: '100%' }}
        />
        <Input
          aria-label="Example text field"
          defaultValue="inputClassName: text-center"
          inputClassName="text-center"
          style={{ width: '100%' }}
        />
        {/* Leading icon done right — InputGroup addon, tight recipe-controlled gap. */}
        <InputGroup style={{ width: '100%' }}>
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Example text field"
            defaultValue="Leading icon via InputGroup"
            placeholder="Search…"
          />
        </InputGroup>
      </div>
    </EnvironmentShell>
  ),
}

/* The payoff: the recessed field reads correctly across every theme — the inset
   counterpart to the raised Button, from the same token architecture. */
export const Themes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
        padding: '1rem',
      }}
    >
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <PreviewCard label={`${theme} / ${mode}`}>
              <div style={{ display: 'grid', gap: '0.625rem' }}>
                <Input
                  aria-label="Example text field"
                  placeholder="Search…"
                  style={{ width: '100%' }}
                />
                <Input
                  aria-label="Example text field, invalid"
                  defaultValue="focused-look"
                  invalid
                  style={{ width: '100%' }}
                />
              </div>
            </PreviewCard>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify({ input: inputContract, inputGroup: inputGroupContract }, null, 2)}
    </pre>
  ),
}
